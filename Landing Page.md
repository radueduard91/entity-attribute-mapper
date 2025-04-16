
# Entity-Attribute Mapper Documentation

## Overview

The Entity-Attribute Mapper is a web application designed to visualize and manage entity-attribute relationships in data models. It allows users to upload entity hierarchies from JSON files, visualize relationships between entities in a graphical diagram, and manage the entities and their attributes through an intuitive interface.

## Technology Stack

### Core Technologies

- **React**: Frontend library for building the user interface
- **TypeScript**: Strongly-typed JavaScript for better code quality and developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Shadcn UI**: Component library built on Radix UI primitives for accessible UI components
- **XY Flow (React Flow)**: Library for creating interactive node-based diagrams

### Key Libraries

- **UUID**: For generating unique identifiers
- **React Hook Form**: For form state management and validation
- **Zod**: For schema validation
- **Lucide React**: For high-quality SVG icons
- **React Dropzone**: For file upload functionality
- **Tanstack Query**: For efficient data fetching and management

## Application Architecture

The application follows a component-based architecture with clear separation of concerns:

- **Pages**: Container components that represent different views of the application
- **Components**: Reusable UI elements
- **Utils**: Utility functions for data manipulation and transformation
- **Types**: TypeScript type definitions for application-wide use
- **Hooks**: Custom React hooks for shared logic

## Components

### Core Components

#### 1. EntityDiagram
**Technology**: XY Flow (React Flow)
**Function**: Provides an interactive canvas for visualizing entity relationships in a hierarchical diagram.
**Importance**: Core visualization component that allows users to see and interact with the entity hierarchy.

#### 2. EntityNode
**Technology**: XY Flow Node Component
**Function**: Renders individual entity nodes in the diagram with their attributes and actions.
**Importance**: Provides a visual representation of entities and their attributes, along with interactive capabilities for editing.

#### 3. DiagramSidebar
**Technology**: React + Tailwind CSS
**Function**: Provides navigation, filtering, and action controls for the diagram.
**Importance**: Allows users to filter entities by system, search for specific entities or attributes, and trigger actions like adding new entities or attributes.

#### 4. FileUpload
**Technology**: React Dropzone
**Function**: Allows users to upload JSON files containing entity and attribute data.
**Importance**: Primary data input mechanism for the application, enabling users to load their data models.

### Form Components

#### 1. EntityForm
**Technology**: React Hook Form + Zod + Shadcn UI
**Function**: Provides a form for creating and editing entities.
**Importance**: Allows users to add new entities or modify existing ones with validation.

#### 2. AttributeForm
**Technology**: React Hook Form + Zod + Shadcn UI
**Function**: Provides a form for creating and editing attributes.
**Importance**: Allows users to add new attributes to entities or modify existing ones with validation.

### Utility Components

Multiple Shadcn UI components are used throughout the application for consistent styling and behavior, including:
- Button
- Dialog
- Select
- Input
- Form
- Card
- Toast

## Data Flow

1. **Data Loading**: Users upload JSON files containing entity and attribute data
2. **Data Parsing**: The application parses the JSON into the internal data structure
3. **Visualization**: Entities and their attributes are displayed in an interactive diagram
4. **Interaction**: Users can add, edit, or delete entities and attributes
5. **Filtering**: Users can filter the displayed entities by system or search term
6. **Export**: Users can export the data as JSON for later use

## Key Utilities

#### 1. json-parser.ts
**Function**: Parses uploaded JSON files into the application's data structure and converts the application data back to JSON for export.
**Importance**: Handles data conversion between file formats and the application's internal representation.

#### 2. diagram-utils.ts
**Function**: Generates nodes and edges for the interactive diagram based on entity relationships.
**Importance**: Transforms raw entity and attribute data into a format suitable for visualization.

## Data Models

### Entity
Represents a data entity with properties like:
- ID
- Name
- Description
- System (EAM, iPen, or Both)
- Parent relationship
- Children relationships
- Reference data flag

### Attribute
Represents a property of an entity with fields like:
- ID
- Name
- Description
- Data Type
- Primary Key flag
- Nullable flag
- Parent Entity ID

## Features

1. **JSON File Upload**: Upload entity hierarchies from a single JSON file
2. **Interactive Diagram**: Visualize entity relationships in a draggable, zoomable diagram
3. **Entity Management**: Add, edit, and delete entities
4. **Attribute Management**: Add, edit, and delete attributes for entities
5. **Filtering**: Filter entities by system (EAM, iPen, Both) or search term
6. **Export**: Export entity data with hierarchies to JSON

## User Interface

### Main Layout
The application is divided into two main sections:
1. **Sidebar**: Contains controls for adding entities/attributes, filtering, and displaying statistics
2. **Main Content**: Shows either the file upload interface or the entity diagram

### Entity Diagram
Displays entities as nodes with their attributes listed inside. Relationship lines connect parent and child entities. The diagram supports:
- Panning and zooming
- Entity selection
- Relationship creation by dragging between entities
- Context-specific actions via buttons on entity nodes

### Forms
Modal dialogs for creating and editing entities and attributes with validation.

## Implementation Details

### Responsive Design
The application uses Tailwind CSS for a responsive layout that works on various screen sizes.

### State Management
Application state is managed through React's useState and useCallback hooks, with potential for integration with more advanced state management for larger applications.

### Error Handling
Toast notifications provide feedback on success or error during operations.

### Performance Considerations
- Memoization via useMemo and useCallback to optimize rendering performance
- Efficient data structures for quick lookups
- Only rendering visible entities when filtered

## Extending the Application

The application is designed to be extensible in several ways:

1. **New Data Sources**: Additional data import formats can be added by implementing new parser utilities
2. **Enhanced Visualization**: The diagram rendering can be extended with new node types or styles
3. **Additional Analysis**: New features could be added to analyze entity relationships or attribute usage
4. **Collaborative Features**: Real-time collaboration could be implemented using technologies like WebSockets

## Conclusion

The Entity-Attribute Mapper provides a powerful yet intuitive interface for visualizing and managing entity-attribute relationships. Its component-based architecture, modern technology stack, and clean separation of concerns make it both user-friendly and developer-friendly for future enhancements.
