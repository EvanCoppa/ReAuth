
CREATE TABLE presentations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    profile_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE TABLE slides (
    id INT PRIMARY KEY AUTO_INCREMENT,
    presentation_id INT NOT NULL,
    slide_type ENUM('title', 'pricing', 'education', 'about', 'services', 'contact') NOT NULL,
    slide_order INT NOT NULL,
    title VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (presentation_id) REFERENCES presentations(id) ON DELETE CASCADE,
    INDEX idx_presentation_order (presentation_id, slide_order)
);


CREATE TABLE slide_elements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slide_id INT NOT NULL,
    element_type ENUM('heading', 'text', 'image') NOT NULL,
    element_order INT NOT NULL,
    content TEXT, -- For text and headings
    image_url VARCHAR(500), -- For images
    alt_text VARCHAR(255), -- For image accessibility
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (slide_id) REFERENCES slides(id) ON DELETE CASCADE,
    INDEX idx_slide_order (slide_id, element_order)
);