
# Reverse Engineering the Entity-Attribute Mapper

This document provides a step-by-step guide on how to reverse engineer the Entity-Attribute Mapper application by using a prompt-based approach. Each section outlines specific prompts that can be used to recreate different components and functionality of the application.

## Understanding the Application Architecture

**Initial Prompt:**
```
Create a React application that visualizes entity-attribute relationships in a data model with an interactive node-based diagram. The application should:
1. Allow users to upload entity hierarchies from JSON files
2. Visualize entity relationships in an interactive diagram
3. Enable users to add, edit, and delete entities and their attributes
4. Filter entities by system type and search term
5. Export the data model back to JSON

Use React, TypeScript, Tailwind CSS, and XY Flow (React Flow) for the visualization.
```

## Core Technology Stack

**Technology Prompt:**
```
Set up a React application with the following technologies:
1. React with TypeScript for the frontend
2. Tailwind CSS for styling
3. Shadcn UI for component library
4. XY Flow (React Flow) for interactive node-based diagrams
5. React Hook Form with Zod for form validation
6. React Router for navigation
7. UUID for generating unique identifiers
8. React Dropzone for file upload

Structure the application with clean separation of concerns using:
- Components folder for reusable UI elements
- Pages folder for route containers
- Utils folder for utility functions
- Types folder for TypeScript definitions
- Hooks folder for custom React hooks
```

## Data Models and Types

**Types Prompt:**
```
Create TypeScript type definitions for the application with the following models:

1. Entity type with:
   - id: string
   - name: string
   - description: string
   - parent: string (relationship to parent entity)
   - system: "EAM" | "iPen" | "Both" (enum SystemType)
   - externalId?: string
   - level?: number
   - isReferenceData?: boolean
   - children?: string[]

2. Attribute type with:
   - id: string
   - name: string
   - description: string
   - isPrimaryKey: boolean
   - entityId: string (reference to parent entity)
   - system: SystemType
   - dataType?: string
   - isNullable?: boolean
   - externalId?: string

3. Additional types for diagram visualization:
   - EntityNode extending Node from XY Flow
   - EntityRelationEdge extending Edge from XY Flow

4. Interface types for UI components like:
   - DiagramSidebarProps
   - FileUploadProps
   - EntityFormProps
   - AttributeFormProps
   - EntityNodeProps
```

## JSON Parser Utility

**Parser Prompt:**
```
Create a utility function that parses entity hierarchy JSON data. The function should:

1. Accept a File object containing JSON data
2. Parse the JSON into Entity and Attribute objects with proper relationships
3. Generate UUID for each entity and attribute
4. Preserve parent-child relationships between entities
5. Link attributes to their parent entities
6. Handle validation and error cases
7. Include a reverse function to convert entities and attributes back to the JSON format for export

The JSON should have a structure like:
{
  "Entity ID": string,
  "Entity Name": string,
  "Entity Description": string,
  "Entity System": string,
  "Reference Data": string,
  "attributes": [
    {
      "Attribute ID": string,
      "Attribute Name": string,
      "Attribute Description": string,
      "Primary Key": string,
      "Data Type": string,
      "Is Nullable": string
    }
  ],
  "parent_id": string,
  "children": string[],
  "level": number
}
```

## Diagram Utilities

**Diagram Utils Prompt:**
```
Create utility functions for the entity-relationship diagram that:

1. Generate nodes from entities and attributes:
   - Position nodes based on entity hierarchy level
   - Apply styling based on entity system type
   - Include entity attributes in each node

2. Generate edges from entity relationships:
   - Create parent-child relationship edges
   - Style edges based on entity system
   - Add arrow markers to indicate relationship direction

3. Add helper functions for:
   - Getting system-specific styling classes
   - Getting system-specific colors
   - Downloading diagram data as JSON
```

## File Upload Component

**File Upload Prompt:**
```
Create a file upload component that:
1. Uses React Dropzone for drag-and-drop file upload
2. Accepts only JSON files
3. Shows loading state during file processing
4. Displays success message after successful upload
5. Shows error messages for invalid files or parsing errors
6. Uses the JSON parser utility to process uploaded files
7. Sends parsed entities and attributes to parent component
8. Has an attractive UI with clear instructions for users
```

## Entity Node Component

**Entity Node Prompt:**
```
Create a custom XY Flow node component that displays an entity with:

1. Entity header with name and system badge
2. Entity description
3. List of attributes with:
   - Name and data type
   - Primary key indicator
   - Edit and delete buttons

The component should:
- Support editing and deleting of entities
- Support editing, deleting, and adding attributes
- Show/hide attribute controls on hover
- Use different styling based on entity system
- Support connection handles for creating relationships
- Display reference data indicator if applicable
```

## Entity Diagram Component

**Entity Diagram Prompt:**
```
Create an interactive diagram component using XY Flow that:

1. Displays entities as nodes with their attributes
2. Shows relationships between entities as edges
3. Allows creating new relationships by connecting nodes
4. Supports filtering entities by:
   - System type (EAM, iPen, Both, or All)
   - Search term (searching in entity/attribute names and descriptions)
5. Includes diagram controls:
   - Pan and zoom
   - Node selection
   - MiniMap for navigation
6. Updates when entities or attributes change
7. Handles edge changes to update entity relationships
```

## Form Components

**Form Components Prompt:**
```
Create modal form components for entities and attributes:

1. Entity Form with:
   - Name field (required)
   - Description field
   - System dropdown (EAM, iPen, Both)
   - Parent entity dropdown
   - Reference data toggle

2. Attribute Form with:
   - Name field (required)
   - Description field
   - Primary key toggle
   - System dropdown
   - Entity dropdown (required)
   - Data type field
   - Nullable toggle

Use React Hook Form with Zod validation. Style forms with Shadcn UI components.
```

## Main Page Structure

**Main Page Prompt:**
```
Create the main page of the application with:

1. Responsive layout with:
   - Sidebar for controls
   - Main area for diagram or file upload

2. File upload view when no data is loaded

3. Diagram view when data is loaded, with:
   - Full-width diagram
   - Sidebar with:
     - Entity/attribute counts
     - System filter dropdown
     - Search input
     - Add entity/attribute buttons
     - Export button

4. Modal dialogs for:
   - Adding/editing entities
   - Adding/editing attributes
   - Confirmation dialogs for deletion
```

## Styling & CSS

**Styling Prompt:**
```
Style the application using Tailwind CSS with:

1. Entity nodes styled by system:
   - EAM: Green color theme
   - iPen: Blue color theme
   - Both: Orange color theme

2. Custom styling for node components:
   - Rounded corners
   - Shadow effects
   - Hover effects
   - Selection indicator

3. Custom styling for edges:
   - Different colors based on system
   - Arrow markers for direction

4. Responsive layout that works on different screen sizes

5. Custom styling for file upload area:
   - Drag-and-drop visual indicators
   - Success/error state styling
```

## Testing & Debugging

**Testing Prompt:**
```
Add debugging and testing capabilities to the application:

1. Console logging for:
   - JSON parsing process
   - Entity-attribute relationships
   - Diagram node and edge generation
   - User interactions with the diagram

2. Error handling for:
   - Invalid JSON format
   - Missing required fields
   - Connection errors
   - Invalid entity relationships

3. User feedback through:
   - Toast notifications for actions
   - Loading indicators
   - Success/error messages
```

## Putting It All Together

**Integration Prompt:**
```
Integrate all components into a complete application:

1. Set up the main App component with routing
2. Create the main Index page with state management for:
   - Entities and attributes
   - File upload status
   - Search and filter functionality
   - Modal dialogs
3. Add the ability to export the entity-attribute model as JSON
4. Ensure the application is responsive and works on different devices
5. Add proper error handling and user feedback throughout the application
```

## Advanced Features

**Advanced Features Prompt:**
```
Enhance the application with additional features:

1. Entity positioning algorithms to optimally arrange the diagram
2. Multiple diagram layout options
3. Ability to manually position nodes and save layouts
4. Undo/redo functionality for diagram changes
5. Entity templates or presets
6. Batch operations on multiple entities
7. Diagram snapshots or versioning
8. Theme switching (light/dark mode)
```

## Optimization Techniques

**Optimization Prompt:**
```
Optimize the application performance:

1. Use React's useMemo and useCallback for expensive calculations
2. Implement virtualization for large entity lists
3. Optimize rendering of complex diagrams with many nodes
4. Add efficient filtering algorithms for large datasets
5. Implement progressive loading for large JSON files
6. Add caching for diagram layouts
```

## Conclusion

By following these prompts in sequence, you can reverse engineer the Entity-Attribute Mapper application. Each prompt builds upon the previous ones, gradually constructing a fully-functional application for visualizing and managing entity-attribute relationships.

The process follows the same architecture and technology choices as the original application while providing flexibility to enhance or modify specific aspects as needed.
