from shared import dependencies as dep

def load_and_preprocess_image(file_path, lower_threshold=None, upper_threshold=None, min_area=50):
    img = dep.cv2.imread(file_path, dep.cv2.IMREAD_UNCHANGED)

    # Convert to grayscale based on input format
    if len(img.shape) > 2 and img.shape[2] == 3:
        img_gray = dep.cv2.cvtColor(img, dep.cv2.COLOR_BGR2GRAY)
    elif len(img.shape) > 2 and img.shape[2] == 4:
        img_gray = dep.cv2.cvtColor(img, dep.cv2.COLOR_BGRA2GRAY)
    else:
        img_gray = img

    # If thresholds not provided - calculate them automatically
    if lower_threshold is None or upper_threshold is None:
        lower_threshold, upper_threshold = 245, 249

    # Binarization by threshold range
    img_binary = ((img_gray >= lower_threshold) & (img_gray <= upper_threshold)).astype(dep.np.uint8)

    # Filter by region area
    labeled_image, num_labels = dep.label(img_binary, connectivity=2, return_num=True)
    regions = dep.regionprops(labeled_image)
    large_labels = [region.label for region in regions if region.area >= min_area]
    img_filtered = dep.np.isin(labeled_image, large_labels).astype(dep.np.uint8)

    return img, img_filtered