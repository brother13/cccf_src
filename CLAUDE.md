# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **vue-element-admin** (v4.3.1), a Vue 2-based admin dashboard system. The project is on the **i18n branch** and has been customized for a specific application ("执行法官助手" - Execution Judge Assistant).

- **Framework**: Vue 2.6.10 + Vue Router 3.0.2 + Vuex 3.1.0
- **UI Library**: Element UI 2.13.2
- **Build Tool**: Vue CLI 4.4.4
- **Test Framework**: Jest

## Common Commands

```bash
# Development
npm run dev                    # Start dev server on http://localhost:9527

# Build
npm run build:prod            # Production build (outputs to dist/)
npm run build:stage           # Staging build
npm run preview               # Preview production build locally

# Code Quality
npm run lint                  # Run ESLint on .js and .vue files
npm run lint -- --fix         # Run ESLint with auto-fix

# Testing
npm run test:unit             # Run Jest unit tests
npm run test:ci               # Run lint + unit tests (CI pipeline)

# Code Generation
npm run new                   # Interactive CLI for generating views/components/store modules
```

## Architecture

### Multi-Module Structure

The codebase has been organized into functional modules beyond the standard vue-element-admin structure:

```
src/
├── api/                  # API calls (original template)
├── dagl/                 # 档案管理 (Archive Management) module
│   ├── api/              # Module-specific APIs
│   ├── router/           # Module routes
│   └── views/            # Module views
├── web/                  # Web module
│   ├── api/
│   ├── router/
│   └── views/
├── views/zxlc/           # 执行流程 (Execution Process) module
├── router/
│   └── index.js          # Main router imports from dagl/router/index.js
├── store/
│   ├── modules/          # Vuex modules (auto-loaded)
│   └── getters.js
└── layout/               # Layout components (sidebar, navbar, tags-view, etc.)
```

### API Pattern

The project uses a custom `postdata` wrapper instead of direct axios calls:

```javascript
// src/api/common.js
import { postdata } from '@/api/common'

export function someApi(data) {
  const action = '/module/action'
  return postdata(action, data)
}
```

The API expects a POST request with this structure:
```json
{
  "action": "/path/to/action",
  "data": { /* payload */ }
}
```

Base API path is configured via `VUE_APP_BASE_API` environment variable:
- Development: `/cccf/` (proxied to `http://localhost/cccf/`)
- Production: `./`

### Permission System

Role-based access control is implemented via:

1. **Router Meta**: Routes have `meta.roles` array defining allowed roles
2. **Async Routes**: Routes are filtered server-side based on user roles
3. **Store Module**: `src/store/modules/permission.js` handles route filtering
4. **Auth Flow**: 
   - Token stored in cookie via `src/utils/auth.js`
   - `permission.js` (router guard) checks token and loads user info/roles
   - Dynamic routes added via `router.addRoutes()`

### Key Directories

- `src/components/` - Reusable Vue components (many custom components)
- `src/layout/` - Application shell (Sidebar, Navbar, TagsView, AppMain)
- `src/store/modules/` - Vuex modules: app, errorLog, permission, settings, tagsView, user
- `src/styles/` - SCSS styles (element-variables, index, sidebar, etc.)
- `src/utils/` - Utility functions (auth, request interceptor, filters, etc.)
- `src/icons/` - SVG icons (loaded as sprite via svg-sprite-loader)
- `mock/` - Mock data (currently commented out in dev server)

### Code Generation (Plop)

Use `npm run new` to generate:
- **Views**: Creates a new page component with router entry
- **Components**: Creates a new reusable component
- **Store**: Creates a new Vuex store module

Templates are in `plop-templates/`.

### Configuration Files

- `vue.config.js` - Vue CLI config with proxy, svg-sprite-loader, webpack optimizations
- `src/settings.js` - App-level settings (title, tagsView, fixedHeader, etc.)
- `.env.development` / `.env.production` - Environment variables
- `jest.config.js` - Unit test configuration

### Important Notes

1. **Router Mode**: Uses hash mode (not history mode) - `mode: 'history'` is commented out
2. **i18n**: This is the i18n branch - internationalization is enabled via `vue-i18n`
3. **Mock**: Mock server is currently disabled (`before: require('./mock/mock-server.js')` commented out)
4. **Element UI**: Configured with `size: 'medium'` and i18n support
5. **SVG Icons**: Placed in `src/icons/svg/`, referenced as `<svg-icon icon-class="name" />`
6. **Request Timeout**: Set to 120 seconds in `src/utils/request.js`
7. **Response Code**: API responses expect `code: 20000` for success

---

## Backend (PHP)

**Location**: `/Applications/MAMP/htdocs/cccf` (ThinkPHP 5.0)

### Backend Structure

```
/Applications/MAMP/htdocs/cccf/
├── app/
│   ├── cccf/                      # Main application module
│   │   ├── config.php             # Module config (token, upload, cache)
│   │   ├── controller/
│   │   │   └── Index.php          # Main API entry - routes all requests
│   │   └── model/                 # Business logic models
│   │       ├── User.php           # User auth & management
│   │       ├── Dagl.php           # 档案管理 (Archive Management)
│   │       ├── Data.php           # Core data operations
│   │       ├── Dept.php           # Department management
│   │       ├── Group.php          # User groups/roles
│   │       ├── Node.php           # Process nodes
│   │       ├── Sjcl.php           # 事件处理 (Event handling)
│   │       ├── Cfcc.php           # 查封财产 (Sealed property)
│   │       ├── Attachment.php     # File uploads
│   │       └── ...
│   ├── config.php                 # Global config
│   ├── database.php               # Database config
│   └── route.php                  # Route definitions
├── public/                        # Web root
│   ├── index.php                  # Entry point with CORS headers
│   └── uploads/                   # Uploaded files
├── runtime/                       # Cache/logs
└── thinkphp/                      # Framework core
```

### API Routing

Single entry point: `public/index.php`

All requests go through `Index::index()` controller method, which routes based on `action` parameter:

```
POST /cccf/index.php
{
  "action": "/user/login",
  "data": { "username": "...", "password": "..." }
}
```

**Action routing pattern**: `/module/action`

| Module | Model | Purpose |
|--------|-------|---------|
| `user` | User | Login, user info, logout |
| `data` | Data | Core data CRUD operations |
| `cccf` | Dagl | Archive management (档案管理) |
| `dept` | Dept | Department management |
| `group` | Group | User groups/roles |
| `node` | Node | Process workflow nodes |
| `sjcl` | Sjcl | Event handling (事件处理) |
| `sys` | System | System configuration |
| `upload` | - | File uploads |

### Key Backend Files

- **`app/cccf/controller/Index.php`**: Main controller, all API requests route through here
- **`app/cccf/model/Common.php`**: Base model with shared database methods
- **`app/cccf/config.php`**: Module settings (token expire: 7 days, auto-logoff: 600s)
- **`public/index.php`**: Entry point with CORS configuration for cross-origin requests

### Database

Configured in `app/database.php`. Uses ThinkPHP's database abstraction layer (`Db` class).

### Response Format

```php
[
  'code' => 20000,        // 20000 = success, 0 = error
  'message' => '...',
  'data' => [...],
  'total' => 100,         // for paginated lists
  'time' => '2024-01...'
]
```
