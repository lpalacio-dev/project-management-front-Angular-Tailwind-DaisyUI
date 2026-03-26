# src
│   index.html
│   main.ts
│   styles.css
│   
├───app
│   │   app.config.ts
│   │   app.css
│   │   app.html
│   │   app.routes.ts
│   │   app.spec.ts
│   │   app.ts
│   │   
│   ├───core
│   │   ├───constants
│   │   │       api-endpoints.ts
│   │   │       app-routes.constants.ts
│   │   │       
│   │   ├───guards
│   │   │       auth.guard.ts
│   │   │       guest.guard.ts
│   │   │       role.guard.ts
│   │   │
│   │   ├───interceptors
│   │   │       auth.interceptor.ts
│   │   │       error.interceptor.ts
│   │   │       loading.interceptor.ts
│   │   │
│   │   ├───models
│   │   │       api-response.model.ts
│   │   │       auth.model.ts
│   │   │       member.model.ts
│   │   │       project.model.ts
│   │   │       task.model.ts
│   │   │       user.model.ts
│   │   │
│   │   ├───services
│   │   │       auth.service.ts
│   │   │       loading.service.ts
│   │   │       member.service.ts
│   │   │       navigation.service.ts
│   │   │       notification.service.ts
│   │   │       project.service.ts
│   │   │       storage.service.ts
│   │   │       task.service.ts
│   │   │       user-search.service.ts
│   │   │       user.service.ts
│   │   │
│   │   ├───signals
│   │   │       auth-signals.service.ts
│   │   │       member-signals.service.ts
│   │   │       project-signals.service.ts
│   │   │       task-signals.service.ts
│   │   │       user-signals.service.ts
│   │   │
│   │   └───utils
│   │           date.utils.ts
│   │           file.utils.ts
│   │           string.utils.ts
│   │
│   ├───features
│   │   ├───auth
│   │   │   │   auth.routes.ts
│   │   │   │
│   │   │   ├───components
│   │   │   │   └───auth-layout
│   │   │   │           auth-layout.component.ts
│   │   │   │
│   │   │   ├───pages
│   │   │   │   ├───login
│   │   │   │   │       login.component.ts
│   │   │   │   │
│   │   │   │   └───register
│   │   │   │           register.component.ts
│   │   │   │
│   │   │   └───validators
│   │   │           password.validators.ts
│   │   │
│   │   ├───dashboard
│   │   │       dashboard.component.ts
│   │   │
│   │   ├───members
│   │   │   └───components
│   │   │       ├───add-member-dialog
│   │   │       │       add-member-dialog.component.ts
│   │   │       │
│   │   │       ├───change-role-dialog
│   │   │       │       change-role-dialog.component.ts
│   │   │       │
│   │   │       ├───member-card
│   │   │       │       member-card.component.ts
│   │   │       │
│   │   │       ├───member-list
│   │   │       │       member-list.component.ts
│   │   │       │
│   │   │       └───remove-member-dialog
│   │   │               remove-member-dialog.component.ts
│   │   │
│   │   ├───profile
│   │   │   ├───components
│   │   │   │   ├───change-password-dialog
│   │   │   │   │       change-password-dialog.component.ts
│   │   │   │   │
│   │   │   │   ├───profile-avatar
│   │   │   │   │       profile-avatar.component.ts
│   │   │   │   │
│   │   │   │   ├───profile-info-card
│   │   │   │   │       profile-info-card.component.ts
│   │   │   │   │
│   │   │   │   └───profile-stats-card
│   │   │   │           profile-stats-card.component.ts
│   │   │   │
│   │   │   └───pages
│   │   │       └───user-profile
│   │   │               user-profile.component.ts
│   │   │
│   │   ├───projects
│   │   │   │   projects.routes.ts
│   │   │   │
│   │   │   ├───components
│   │   │   │   ├───project-card
│   │   │   │   │       project-card.component.ts
│   │   │   │   │
│   │   │   │   ├───project-edit-dialog
│   │   │   │   │       project-edit-dialog.component.ts
│   │   │   │   │
│   │   │   │   ├───project-header
│   │   │   │   │       project-header.component.ts
│   │   │   │   │
│   │   │   │   ├───project-list-toolbar
│   │   │   │   │       project-list-toolbar.component.ts
│   │   │   │   │
│   │   │   │   ├───project-skeleton
│   │   │   │   │       project-skeleton.component.ts
│   │   │   │   │
│   │   │   │   ├───project-stats
│   │   │   │   │       project-stats.component.ts
│   │   │   │   │
│   │   │   │   ├───project-tabs
│   │   │   │   │       project-tabs.component.ts
│   │   │   │   │
│   │   │   │   └───projects-empty-state
│   │   │   │           projects-empty-state.component.ts
│   │   │   │
│   │   │   └───pages
│   │   │       ├───project-create
│   │   │       │       project-create.component.ts
│   │   │       │
│   │   │       ├───project-detail
│   │   │       │       project-detail.component.ts
│   │   │       │
│   │   │       └───project-list
│   │   │               project-list.component.ts
│   │   │
│   │   └───tasks
│   │       └───components
│   │           ├───task-delete-confirm
│   │           │       task-delete-confirm.component.ts
│   │           │
│   │           ├───task-form-dialog
│   │           │       task-form-dialog.component.ts
│   │           │
│   │           ├───task-item
│   │           │       task-item.component.ts
│   │           │
│   │           └───task-list
│   │                   task-list.component.ts
│   │
│   └───shared
│       ├───components
│       │   ├───loading-spinner
│       │   │       loading-spinner.component.ts
│       │   │
│       │   ├───profile-image-upload
│       │   │       profile-image-upload.component.ts
│       │   │
│       │   ├───toast-container
│       │   │       toast-container.component.ts
│       │   │
│       │   ├───top-loading-bar
│       │   │       top-loading-bar.component.ts
│       │   │
│       │   └───topbar
│       │           topbar.component.ts
│       │
│       ├───directives
│       │       has-roles.directive.ts
│       │
│       ├───layouts
│       │   └───main-layout
│       │           main-layout.component.ts
│       │
│       └───pages
│           ├───forbidden
│           │       forbidden.component.ts
│           │
│           └───not-found
│                   not-found.component.ts
│
└───environments
        environment.development.ts
        environment.ts