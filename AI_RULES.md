# AI Rules for ChiTi Application

This document outlines the technical stack and guidelines for using various libraries within the ChiTi application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of each technology.

## Tech Stack Overview

The ChiTi application is built using a modern web development stack, focusing on performance, developer experience, and a robust user interface.

*   **React**: A declarative, component-based JavaScript library for building user interfaces.
*   **TypeScript**: A superset of JavaScript that adds static typing, improving code quality and developer productivity.
*   **Vite**: A fast build tool that provides an instant development server and optimized build process.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **React Router**: A standard library for routing in React applications, enabling navigation between different views.
*   **Supabase**: An open-source Firebase alternative providing a PostgreSQL database, authentication, and storage capabilities.
*   **React Query (TanStack Query)**: A powerful library for managing, caching, and synchronizing server state in React applications.
*   **date-fns**: A comprehensive and lightweight JavaScript date utility library.
*   **lucide-react**: A collection of beautiful and consistent open-source icons.
*   **Sonner**: A modern toast component for displaying notifications.

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

*   **UI Components**:
    *   **Primary Choice**: Always use components from `shadcn/ui` for all user interface elements (buttons, inputs, dialogs, cards, etc.).
    *   **Custom Components**: If a required component is not available in `shadcn/ui`, create a new, small, and focused custom component. Ensure it uses Tailwind CSS for styling.
*   **Styling**:
    *   **Exclusive Use**: All styling must be done using **Tailwind CSS** utility classes. Avoid inline styles or separate CSS modules/files (except for `src/index.css` for global styles).
    *   **Responsiveness**: Always design components to be responsive using Tailwind's responsive utility classes.
*   **State Management**:
    *   **Local State**: Use React's built-in `useState` and `useContext` hooks for managing component-specific and application-wide client-side state.
    *   **Server State**: Use **React Query** (`@tanstack/react-query`) for fetching, caching, and updating data from the backend (server state).
*   **Routing**:
    *   **Client-Side Navigation**: Use **React Router** (`react-router-dom`) for all client-side routing and navigation. Keep main routes defined in `src/App.tsx`.
*   **Authentication & Database**:
    *   **Backend Interaction**: All authentication and database interactions (CRUD operations) must be handled via **Supabase** (`@supabase/supabase-js`).
*   **Icons**:
    *   **Icon Library**: Use icons from the **lucide-react** library.
*   **Date Handling**:
    *   **Date Utilities**: Use **date-fns** for all date formatting, parsing, and manipulation tasks.
*   **Notifications**:
    *   **Toast Notifications**: Use **Sonner** (`sonner`) for displaying all toast notifications to the user.