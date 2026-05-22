# Firebase Setup Instructions

## Firebase Realtime Database Rules

Since you're in test mode, you need to set up your Firebase Realtime Database rules. Go to your Firebase Console and set these rules:

```json
{
  "rules": {
    "projects": {
      ".read": true,
      ".write": true,
      "$projectId": {
        ".validate": "newData.hasChildren(['name', 'description', 'imageUrl', 'redirectUrl', 'order'])"
      }
    }
  }
}
```

### Explanation:
- **`.read": true`** - Anyone can read the projects (needed for the public projects page)
- **`.write": true`** - Anyone can write (since we're in test mode and handling auth in the app)
- **`.validate`** - Ensures that each project has all required fields

## Important Security Note

For production, you should:
1. Implement Firebase Authentication
2. Restrict write access to authenticated admin users only
3. Update the rules to something like:

```json
{
  "rules": {
    "projects": {
      ".read": true,
      ".write": "auth != null && auth.token.admin === true"
    }
  }
}
```

## Admin Credentials

- **Username:** admin
- **Password:** bufferclickbutterlick

## Routes

- **/** - Home page with introduction
- **/projects** - Browse all projects
- **/admin** - Admin login page
- **/admin/panel** - Admin panel (requires login)

## Features

### Public Pages:
- ✅ Home page with profile picture and introduction
- ✅ Projects page displaying all projects in order
- ✅ Click on any project to open its redirect URL

### Admin Panel:
- ✅ Secure login (session-based)
- ✅ Add new projects with:
  - Project name
  - Description
  - Image URL
  - Redirect URL
- ✅ Reorder projects (move up/down)
- ✅ Delete projects
- ✅ Real-time updates from Firebase

## Color Theme
Black and white theme throughout the entire site.
