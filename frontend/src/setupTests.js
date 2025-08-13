import '@testing-library/jest-dom';

// ✅ Fully mock Chakra UI to avoid theme and component rendering issues
jest.mock('@chakra-ui/react', () => {
  return {
    // Mocks the theming function so App.js doesn't break
    extendTheme: jest.fn(() => ({})),

    // Minimal ChakraProvider mock
    ChakraProvider: ({ children }) => <div>{children}</div>,

    // Common hooks
    useToast: jest.fn(),

    // Common components
    Box: ({ children, ...props }) => <div {...props}>{children}</div>,
    Text: ({ children, ...props }) => <span {...props}>{children}</span>,
    Button: ({ children, ...props }) => <button {...props}>{children}</button>,
    Input: (props) => <input {...props} />,
    FormControl: ({ children }) => <div>{children}</div>,
    FormLabel: ({ children }) => <label>{children}</label>,
    VStack: ({ children }) => <div>{children}</div>,
    HStack: ({ children }) => <div>{children}</div>,
    Heading: ({ children }) => <h1>{children}</h1>,
  };
});

// ✅ Mock react-router-dom's useNavigate so navigation calls don’t break
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));
