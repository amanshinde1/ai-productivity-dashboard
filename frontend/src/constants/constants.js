// src/constants/constants.js

export const FOCUS_SESSION_DURATION = 25; // in minutes

export const mockTasks = [
  {
    id: "1",
    title: "Finish project proposal",
    description: "Complete and review the proposal for the new marketing campaign. Ensure all team feedback is incorporated.",
    isCompleted: false,
    category: "Work",
    priority: "High",
    status: "In Progress",
    dueDate: "2024-08-30",
    creationDate: "2024-08-10T10:00:00Z"
  },
  {
    id: "2",
    title: "Grocery shopping",
    description: "Buy milk, bread, eggs, and vegetables for the week. Don't forget the coffee!",
    isCompleted: false,
    category: "Personal",
    priority: "Medium",
    status: "To Do",
    dueDate: "2024-08-12",
    creationDate: "2024-08-11T15:30:00Z"
  },
  {
    id: "3",
    title: "Code review for pull request #42",
    description: "Review the code from John's pull request. Check for logic errors and adherence to coding standards.",
    isCompleted: true,
    category: "Work",
    priority: "Low",
    status: "Done",
    dueDate: "2024-08-11",
    creationDate: "2024-08-09T09:00:00Z"
  },
  {
    id: "4",
    title: "Plan weekend trip",
    description: "Research hotels and activities for the upcoming weekend trip to the mountains.",
    isCompleted: false,
    category: "Personal",
    priority: "High",
    status: "To Do",
    dueDate: "2024-08-15",
    creationDate: "2024-08-08T18:00:00Z"
  },
  {
    id: "5",
    title: "Write blog post about React hooks",
    description: "Draft a blog post explaining the useEffect and useState hooks in React. Include code examples.",
    isCompleted: false,
    category: "Hobby",
    priority: "Medium",
    status: "In Progress",
    dueDate: "2024-08-20",
    creationDate: "2024-08-07T14:00:00Z"
  },
  {
    id: "6",
    title: "Water the plants",
    description: "Water all indoor and outdoor plants.",
    isCompleted: false,
    category: "Personal",
    priority: "Low",
    status: "To Do",
    dueDate: "2024-08-12",
    creationDate: "2024-08-12T08:00:00Z"
  }
];

export const mockProjects = [
  { name: 'Marketing Campaign', progress: 75 },
  { name: 'Website Redesign', progress: 40 },
  { name: 'Mobile App', progress: 90 },
  { name: 'Internal Tooling', progress: 20 },
];
