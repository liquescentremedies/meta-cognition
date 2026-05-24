#!/usr/bin/env python3
"""
Hard Rubbish Scout — Frankston City Council
Finds your collection zone and date by geocoding an address.

Usage:
    python3 hard-rubbish-scout.py "3/17 Sassafras Drive Frankston"
    python3 hard-rubbish-scout.py --lat -38.154 --lon 145.134
"""

import sys
import json
import gzip
import urllib.request
import urllib.parse

HARD_WASTE_URL = "https://connect.pozi.com/userdata/frankston-publisher/Community/Hard_Waste_Collection_(Widget).json"
KERBSIDE_URL   = "https://connect.pozi.com/userdata/frankston-publisher/Community/Kerbside_Garbage_Collection_(Widget).json"
NOMINATIM_URL  = "https://nominatim.openstreetmap.org/search"


def fetch_json(url):
    req = urllib.request.Request(url, headers={
        "User-Agent": "glimmer-hard-rubbish-scout/1.0",
        "Accept-Encoding": "gzip, deflate",
    })
    with urllib.request.urlopen(req, timeout=10) as r:
        raw = r.read()
        if r.info().get("Content-Encoding") == "gzip" or raw[:2] == b"\x1f\x8b":
            raw = gzip.decompress(raw)
        return json.loads(raw)


def geocode(address):
    query = urllib.parse.urlencode({"q": address + ", Victoria, Australia", "format": "json", "limit": 1})
    url = f"{NOMINATIM_URL}?{query}"
    req = urllib.request.Request(url, headers={"User-Agent": "glimmer-hard-rubbish-scout/1.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        results = json.loads(r.read())
    if not results:
        return None, None
    return float(results[0]["lat"]), float(results[0]["lon"])


def point_in_polygon(px, py, polygon):
    """Ray casting — works with flat coordinate rings."""
    inside = False
    n = len(polygon)
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > py) != (yj > py)) and (px < (xj - xi) * (py - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


def find_zone(lat, lon, geojson):
    """Return the feature whose geometry contains (lon, lat)."""
    for feature in geojson.get("features", []):
        geom = feature.get("geometry", {})
        geom_type = geom.get("type", "")
        coords = geom.get("coordinates", [])

        rings = []
        if geom_type == "Polygon":
            rings = coords  # list of rings
        elif geom_type == "MultiPolygon":
            for poly in coords:
                rings.extend(poly)

        for ring in rings:
            if point_in_polygon(lon, lat, ring):
                return feature
    return None


def summarise(feature, label):
    if not feature:
        print(f"  {label}: zone not found for this address")
        return
    props = feature.get("properties", {})
    fid   = feature.get("id", "?")

    # Hard waste: Next_Service field
    next_svc = props.get("Next_Service") or props.get("next_service")
    if next_svc:
        print(f"  {label}: Zone {fid} — {next_svc}")
        return

    # Kerbside: rub_day, rec_day, grn_day, gls_day
    days = []
    for key, name in [("rub_day","General"), ("rec_day","Recycling"), ("grn_day","Green"), ("gls_day","Glass")]:
        val = props.get(key)
        if val:
            days.append(f"{name}={val}")
    print(f"  {label}: Zone {fid} — {', '.join(days) if days else json.dumps(props)}")


def main():
    args = sys.argv[1:]

    lat = lon = None

    if "--lat" in args and "--lon" in args:
        lat = float(args[args.index("--lat") + 1])
        lon = float(args[args.index("--lon") + 1])
        address = f"{lat}, {lon}"
    elif args:
        address = " ".join(a for a in args if not a.startswith("--"))
        print(f"Geocoding: {address}")
        lat, lon = geocode(address)
        if lat is None:
            print("Could not geocode that address. Try --lat / --lon flags instead.")
            sys.exit(1)
        print(f"Coordinates: {lat:.5f}, {lon:.5f}\n")
    else:
        # Default: Sassafras Drive, Frankston
        address = "3/17 Sassafras Drive Frankston"
        print(f"No address given — using default: {address}")
        lat, lon = geocode(address)
        if lat is None:
            print("Geocoding failed.")
            sys.exit(1)
        print(f"Coordinates: {lat:.5f}, {lon:.5f}\n")

    print("Fetching Frankston collection zones...")
    hard_waste = fetch_json(HARD_WASTE_URL)
    kerbside   = fetch_json(KERBSIDE_URL)

    hw_zone = find_zone(lat, lon, hard_waste)
    kb_zone = find_zone(lat, lon, kerbside)

    print(f"\nResults for {address}:")
    summarise(hw_zone, "Hard rubbish")
    summarise(kb_zone, "Kerbside bins")

    if hw_zone:
        props = hw_zone.get("properties", {})
        next_svc = props.get("Next_Service") or props.get("next_service") or ""
        print(f"\nFull hard waste properties:")
        for k, v in props.items():
            if v:
                print(f"  {k}: {v}")


if __name__ == "__main__":
    main()
