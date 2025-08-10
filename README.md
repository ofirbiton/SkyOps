# SkyOps – Automated Drone Route Planning System

<p align="center">
  <img src="SkyOps-Frontend/src/Images/skyops logo.png" alt="SkyOps Logo" width="300"/>
</p>



## 📌 Overview
SkyOps is a **Full-Stack system** that automatically plans safe and efficient drone flight paths in **urban environments**.  
Operators select a flight area, mark **takeoff** and **landing** points, and the system builds the **shortest feasible route** while avoiding buildings and blocked pixels.  
The route can be **visualized**, **downloaded as coordinates (CSV)**, and **exported to a Litchi-compatible CSV** for automated execution.

> **Recommended map scale:** For the most effective building detection, use a map scale of **1:2,500**.

---

## ✈ End-to-End Flow (What Happens Under the Hood)
This section explains **how each thing is detected/computed**, with the key functions and the exact method used.

### 1) Inputs & Color-Pixel Detection (takeoff/landing)
- **Files received:** `buildings_image`, `satellite_image`, and **top-left / bottom-right** real-world coordinates that define the image diagonal.
- **Takeoff & landing pixels:** `services/mission_utils.py::find_color_pixel`
  - Scans the image for an **exact RGB match**: takeoff = **(0,255,0)**, landing = **(0,0,255)**.
  - Returns the first matching pixel coordinate `(x, y)`.

### 2) Binary Mask Creation (where are the buildings?)
- **Loader:** `core/image_loader.py::load_and_preprocess_image`
  - Reads the building map and converts to **grayscale**.
  - Applies a **value range threshold** (defaults: 245–249) to create a **binary mask** where candidate building pixels are `1`.
  - **Small-region filter:** labels connected components and **keeps only regions with area ≥ `min_area`** (default 50 px) to suppress noise.
  - **Practical note:** Best results for building extraction were obtained when viewing/working at **1:2,500** map scale.

### 3) Skeletonization of Free Space
- **Skeleton creation:** `core/skeletonizer.py::skeletonize_image`
  - **Inverts** the binary mask and applies `skimage.morphology.skeletonize`.
  - **Cleans borders** (zeros out outermost rows/columns) to avoid edge artifacts.
- **Dead-end removal:** `core/skeletonizer.py::remove_deadends`
  - Repeatedly finds **degree‑1 (dead-end) skeleton pixels** using a 3×3 neighbor-count convolution and **removes them until none remain**.
  - Rationale: prunes spurs to keep only meaningful corridors.

### 4) Junction (Node) Detection
- **Initial marking:** `core/junction_detector.py::highlight_dense_skeleton_nodes`
  - Treats skeleton as a 4/8-connected graph on pixels.
  - Marks **junction pixels** in **yellow** where the **neighbor count ≥ 3** (via a 3×3 kernel over the skeleton mask).
- **Refinement:** `core/junction_detector.py::refine_yellow_nodes`
  - Runs **connected-components** over yellow pixels and picks **one representative pixel per cluster** (topmost pixel) to avoid dense blobs.
  - Output: a sparse, clean set of yellow node pixels.

### 5) Graph Construction (connecting nodes)
- **Neighbor discovery via BFS over the skeleton:** `core/graph_builder.py::find_neighbors`
  - For each yellow node `(y,x)`, does a **BFS along blue skeleton pixels** to find **other yellow nodes reachable** without leaving the skeleton.
  - This is how “junctions are found/connected via BFS.”
- **Edge validation (line-of-sight without building collision):**
  - `core/graph_builder.py::is_line_clear_of_buildings` uses **Bresenham line rasterization** to ensure the straight segment between two nodes does **not** cross any **white (building) pixels**.
- **Edge creation & drawing:** `core/graph_builder.py::connect_yellow_junctions`
  - Adds **undirected edges** with **Euclidean distance** weights between nodes that passed the collision check.
  - Draws thin red segments for visualization.
  - Produces `adjacency_dict` for the pathfinder.

### 6) Start/End Integration
- **Direct route fast‑path:** before graphing, `core/graph_builder.py::line_intersects_building` checks if the **straight line** between takeoff and landing is clear.  
  - If **clear**, the system **uses the direct segment** and skips graph construction.
- **Otherwise:** `core/graph_builder.py::add_point_to_graph`
  - Connects the **start** and **end** pixels to their **nearest existing node(s)** where the straight line **does not intersect** buildings (uses Bresenham over the **binary building mask**).
  - If needed, this step can allow `ignore_building=True` to guarantee connection for visualization while still respecting collisions in route computation.

### 7) Shortest Path Search
- **Algorithm:** `core/pathfinder.py::dijkstra`
  - Standard **Dijkstra with a min‑heap** over `adjacency_dict`.
  - Stops when the end node is popped (early exit).  
  - Reconstructs the route via the `came_from` map.

### 8) Route Simplification (line-of-sight optimization)
- **Greedy shortcutting:** `core/pathfinder.py::optimize_path`
  - Iterates through the path and repeatedly **jumps forward** to the **farthest later node** that is **line‑of‑sight reachable** (no building intersection) using Bresenham over the **building mask**.
  - Keeps **only turning points and endpoints**, reducing waypoint count.

### 9) Pixel→World Coordinate Mapping & Outputs
- **Mapping:** `services/mission_io.py::generate_and_respond_path`
  - If the image is `width × height` and the diagonal is defined by **(X_top_left, Y_top_left)** → **(X_bottom_right, Y_bottom_right)**, each pixel `(x,y)` is mapped **linearly**:
    - `real_x = X_top_left + x * ((X_bottom_right - X_top_left) / width)`
    - `real_y = Y_top_left + y * ((Y_bottom_right - Y_top_left) / height)`
- **Artifacts produced:**
  - **Route over buildings** image (`auto_route.png`).
  - **Route over satellite** image (`mission_satellite.png`).
  - **Coordinates CSV (lat,lon)** via the frontend exporter (`generateLitchiCsv.js`) — **Litchi‑compatible**.
  - *(Optionally, for debugging)* **Coordinates JSON** may also be produced by the backend.

### 10) Litchi CSV Export (frontend)
- **Generator:** `frontend/generateLitchiCsv.js`
  - Emits standard Litchi headers and a row per waypoint (`latitude, longitude, altitude(m), ...`).
  - **Heading** left as `-1` (free), **curve size** set to `0.2` at endpoints and `108` for interior points, **speed** default `8 m/s` (adjustable).

---

## 🔐 Frontend UX Summary (Operator’s Perspective)
1. Log in as **pilot/admin**.
2. Draw the **flight area** on the map (GovMap) — preferably at **1:2,500** scale for optimal building extraction.
3. Click to place **takeoff (green)** and **landing (red)**.
4. Submit → receive **visual overlays** and **download links** (CSV/JSON).

---

## 🛠 Technology
- **Backend:** Python, Flask, OpenCV, scikit-image, NumPy
- **Frontend:** React, GovMap API
- **Core algorithms:** BFS over skeleton for neighbor discovery, Bresenham line rasterization for collision checks, Dijkstra for shortest path, greedy line-of-sight **route optimization**, linear pixel→world mapping.
