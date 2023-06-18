# HiSpace API Documentation

This is the API documentation for the backend server.

## User

### Signup
- Endpoint: `POST /api/signup`
- Description: Registers a new user.
- Body Parameters:
  - `email`: User's email address (string)
  - `password`: User's password (string)
- Returns: User object

### Login
- Endpoint: `POST /api/login`
- Description: Logs in a user.
- Body Parameters:
  - `email`: User's email address (string)
  - `password`: User's password (string)
- Returns: User object with access token

### Reset Password
- Endpoint: `POST /api/reset-password`
- Description: Sends a password reset email to the user.
- Body Parameters:
  - `email`: User's email address (string)
- Returns: Success message

### Update Password with Token
- Endpoint: `POST /api/reset-password/:token`
- Description: Updates the user's password using the reset token.
- URL Parameters:
  - `token`: Password reset token (string)
- Body Parameters:
  - `password`: New password (string)
- Returns: Success message

### Verify Token
- Endpoint: `POST /api/verify-token/:token`
- Description: Verifies the user account using the verification token.
- URL Parameters:
  - `token`: Verification token (string)
- Returns: Success message

### Get User Details
- Endpoint: `GET /api/user`
- Description: Retrieves the details of the authenticated user.
- Returns: User object

### Update User Details
- Endpoint: `PUT /api/user`
- Description: Updates the details of the authenticated user.
- Body Parameters: User details to be updated
- Returns: Updated user object

### Create Wishlist
- Endpoint: `POST /api/user/wishlist`
- Description: Creates a wishlist item for the authenticated user.
- Body Parameters:
  - `locationId`: ID of the location to be added to the wishlist (string)
- Returns: Wishlist item object

### Get User Wishlist
- Endpoint: `GET /api/user/wishlist`
- Description: Retrieves the wishlist items of the authenticated user.
- Returns: Wishlist items array

### Delete Wishlist Item
- Endpoint: `DELETE /api/user/wishlist/:locationId`
- Description: Deletes a wishlist item for the authenticated user.
- URL Parameters:
  - `locationId`: ID of the location to be removed from the wishlist (string)
- Returns: Success message

## Location

### Create Location
- Endpoint: `POST /api/location`
- Description: Creates a new location.
- Body Parameters: Location details
- Returns: Created location object

### Get All Locations
- Endpoint: `GET /api/location`
- Description: Retrieves all locations.
- Returns: Array of location objects

### Search Locations by Owner
- Endpoint: `GET /api/location/search`
- Description: Retrieves locations owned by a specific user.
- Query Parameters:
  - `ownerId`: ID of the owner (string)
- Returns: Array of location objects

### Get Location by ID
- Endpoint: `GET /api/location/:locationId`
- Description: Retrieves a location by ID.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Returns: Location object

### Delete Location
- Endpoint: `DELETE /api/location/:locationId`
- Description: Deletes a location.
- URL Parameters:
  - `locationId`: ID of the location to be deleted (string)
- Returns: Success message

## Menu

### Add Menu
- Endpoint: `POST /api/location/:locationId/menu`
- Description: Adds a menu to a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Body Parameters: Menu details
- Returns: Created menu object

### Get All Menus
- Endpoint: `GET /api/location/:locationId/menu`
- Description: Retrieves all menus of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Returns: Array of menu objects

### Update Menu
- Endpoint: `PUT /api/location/:locationId/menu/:menuId`
- Description: Updates a menu of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
  - `menuId`: ID of the menu to be updated (string)
- Body Parameters: Updated menu details
- Returns: Updated menu object

### Delete Menu
- Endpoint: `DELETE /api/location/:locationId/menu/:menuId`
- Description: Deletes a menu from a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
  - `menuId`: ID of the menu to be deleted (string)
- Returns: Success message

## Facility

### Create Facility
- Endpoint: `POST /api/location/:locationId/facility`
- Description: Creates a facility for a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Body Parameters: Facility details
- Returns: Created facility object

### Get Facilities
- Endpoint: `GET /api/location/:locationId/facility`
- Description: Retrieves all facilities of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Returns: Array of facility objects

### Update Facility
- Endpoint: `PUT /api/location/:locationId/facility/:facilityId`
- Description: Updates a facility of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
  - `facilityId`: ID of the facility to be updated (string)
- Body Parameters: Updated facility details
- Returns: Updated facility object

### Delete Facility
- Endpoint: `DELETE /api/location/:locationId/facility/:facilityId`
- Description: Deletes a facility from a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
  - `facilityId`: ID of the facility to be deleted (string)
- Returns: Success message

## Image

### Add Gallery Image
- Endpoint: `POST /api/location/:locationId/galery`
- Description: Adds an image to the gallery of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Body Parameters: Image file
- Returns: Success message

## Review

### Create Review
- Endpoint: `POST /api/location/:locationId/review`
- Description: Creates a review for a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Body Parameters: Review details
- Returns: Created review object

### Get All Reviews
- Endpoint: `GET /api/location/:locationId/review`
- Description: Retrieves all reviews of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Returns: Array of review objects

### Update Review
- Endpoint: `PUT /api/location/:locationId/review`
- Description: Updates a review of a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Body Parameters: Updated review details
- Returns: Updated review object

### Delete Review
- Endpoint: `DELETE /api/location/:locationId/review`
- Description: Deletes a review from a location.
- URL Parameters:
  - `locationId`: ID of the location (string)
- Returns: Success message

## Invalid Route
- Endpoint: `*`
- Description: Handles invalid routes.
- Returns: Error message

## Serve Frontend
- Endpoint: `/*`
- Description: Serves the frontend index.html file.
- Returns: Frontend index.html file

