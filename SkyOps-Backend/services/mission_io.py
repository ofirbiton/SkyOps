import os
import json
from flask import jsonify
from shared import dependencies as dep

GREEN = (0, 255, 0)

# Full server address in Railway (constant)
SERVER_URL = "https://skyops-backend-production-0228.up.railway.app"
LOCAL_URL = "http://localhost:5000"

OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'static', 'outputs')


def generate_and_respond_path(path_int, original_image, satellite_path,
                              takeoff_pixel, landing_pixel,
                              X_top_left, Y_top_left, X_bottom_right, Y_bottom_right):

    height, width = original_image.shape[:2]
    real_path = []
    for (pixel_x, pixel_y) in path_int:
        real_x = X_top_left + pixel_x * ((X_bottom_right - X_top_left) / width)
        real_y = Y_top_left + pixel_y * ((Y_bottom_right - Y_top_left) / height)
        real_path.append({"x": real_x, "y": real_y})

    # Draw the route on the image
    final_image = original_image.copy()
    for i in range(len(path_int) - 1):
        xA, yA = path_int[i]
        xB, yB = path_int[i+1]
        dep.cv2.line(final_image, (xA, yA), (xB, yB), GREEN, 2)

    rgb_out = dep.cv2.cvtColor(final_image, dep.cv2.COLOR_BGR2RGB)
    output_graph_filename = "auto_route.png"
    route_image_path = os.path.join(OUTPUT_FOLDER, output_graph_filename)
    dep.cv2.imwrite(route_image_path, rgb_out)

    # Draw the route on the satellite image as well
    satellite_image = dep.cv2.imread(satellite_path)
    if satellite_image.shape[2] == 4:
        satellite_image = dep.cv2.cvtColor(satellite_image, dep.cv2.COLOR_BGRA2BGR)

    for i in range(len(path_int) - 1):
        pt1 = path_int[i]
        pt2 = path_int[i+1]
        dep.cv2.line(satellite_image, pt1, pt2, (255, 0, 0), 2)

    output_satellite_filename = "mission_satellite.png"
    satellite_output_path = os.path.join(OUTPUT_FOLDER, output_satellite_filename)
    dep.cv2.imwrite(satellite_output_path, satellite_image)

    # Write the coordinates file
    coord_filename = "auto_route_coordinates.txt"
    coord_filepath = os.path.join(OUTPUT_FOLDER, coord_filename)
    coords_json = {"path": real_path}
    with open(coord_filepath, "w", encoding="utf-8") as f:
        f.write(json.dumps(coords_json, indent=2))
    print("🛰️ Final URLs:")
    print(" → routeImageUrl:", f"{LOCAL_URL}/static/outputs/{output_graph_filename}")
    print(" → satelliteImageUrl:", f"{LOCAL_URL}/static/outputs/{output_satellite_filename}")
    print(" → coordinatesFileUrl:", f"{LOCAL_URL}/static/outputs/{coord_filename}")

    # Send to Frontend with full URLs
    return jsonify({
        "message": "Mission created successfully (path processed)",
        "success": True,
        "routeImageUrl": f"{LOCAL_URL}/static/outputs/{output_graph_filename}",
        "satelliteImageUrl": f"{LOCAL_URL}/static/outputs/{output_satellite_filename}",
        "coordinatesFileUrl": f"{LOCAL_URL}/static/outputs/{coord_filename}"
    }), 200


def handle_direct_route(takeoff_pixel, landing_pixel, building_mask, satellite_path,
                        X_top_left, Y_top_left, X_bottom_right, Y_bottom_right, original_image):
    mask_image = (building_mask * 255).astype(dep.np.uint8)
    mask_image = dep.cv2.cvtColor(mask_image, dep.cv2.COLOR_GRAY2BGR)
    dep.cv2.line(mask_image, takeoff_pixel, landing_pixel, GREEN, 2)
    path_int = [takeoff_pixel, landing_pixel]

    return generate_and_respond_path(
        path_int=path_int,
        original_image=mask_image,
        satellite_path=satellite_path,
        takeoff_pixel=takeoff_pixel,
        landing_pixel=landing_pixel,
        X_top_left=X_top_left,
        Y_top_left=Y_top_left,
        X_bottom_right=X_bottom_right,
        Y_bottom_right=Y_bottom_right
    )

