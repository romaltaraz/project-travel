-- Vacations Project — Database Schema
-- MySQL 8.0+

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  firstName   VARCHAR(50)  NOT NULL,
  lastName    VARCHAR(50)  NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user','admin') NOT NULL DEFAULT 'user',
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vacations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  destination   VARCHAR(100)   NOT NULL,
  description   TEXT           NOT NULL,
  startDate     DATE           NOT NULL,
  endDate       DATE           NOT NULL,
  price         DECIMAL(8,2)   NOT NULL,
  imageFileName VARCHAR(255)   NOT NULL,
  createdAt     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_vacation_dates  CHECK (endDate >= startDate),
  CONSTRAINT chk_vacation_price  CHECK (price > 0 AND price <= 10000)
);

CREATE TABLE IF NOT EXISTS likes (
  userId      INT NOT NULL,
  vacationId  INT NOT NULL,
  PRIMARY KEY (userId, vacationId),
  FOREIGN KEY (userId)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  userId      INT  NOT NULL,
  vacationId  INT  NOT NULL,
  rating      INT  NOT NULL,
  comment     TEXT,
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY  uq_user_vacation (userId, vacationId),
  FOREIGN KEY (userId)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE,
  CONSTRAINT  chk_rating CHECK (rating >= 1 AND rating <= 5)
);

CREATE TABLE IF NOT EXISTS bookings (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  userId           INT            NOT NULL,
  vacationId       INT            NOT NULL,
  numTravelers     INT            NOT NULL,
  totalPrice       DECIMAL(10,2)  NOT NULL,
  status           ENUM('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
  bookingReference VARCHAR(20)    NOT NULL UNIQUE,
  createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId)     REFERENCES users(id)     ON DELETE CASCADE,
  FOREIGN KEY (vacationId) REFERENCES vacations(id) ON DELETE CASCADE,
  CONSTRAINT chk_travelers CHECK (numTravelers >= 1)
);

CREATE TABLE IF NOT EXISTS hotels (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(150)   NOT NULL,
  city             VARCHAR(100)   NOT NULL,
  starRating       INT            NOT NULL,
  guestScore       DECIMAL(3,1)   NOT NULL,
  reviewsCount     INT            NOT NULL DEFAULT 0,
  pricePerNight    DECIMAL(8,2)   NOT NULL,
  freeCancellation BOOLEAN        NOT NULL DEFAULT FALSE,
  amenities        JSON           NOT NULL,
  images           JSON           NOT NULL,
  createdAt        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hotel_likes (
  userId   INT NOT NULL,
  hotelId  INT NOT NULL,
  PRIMARY KEY (userId, hotelId),
  FOREIGN KEY (userId)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (hotelId) REFERENCES hotels(id) ON DELETE CASCADE
);
