# QuizTaker BJOT Portal - Codex Instructions

## Project Overview
This is a Next.js application for the BJOT (Blast Jamb Online Tutorial) portal. Users can register for the exam by providing personal information and selecting subject combinations, then log in to access the quiz system.

## Key Features
- User registration with detailed profile information
- Email-based login system
- Subject combination selection (exactly 4 question sets required)
- Responsive design with Tailwind CSS
- Modern UI using Lucide React icons
- Form validation and error handling
- Loading states and user feedback

## Technology Stack
- **Framework**: Next.js 16.0.10
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: Custom components with Lucide React icons
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios (in dependencies, though fetch API is used in code)
- **Cookies**: cookies-next for handling cookies

## Development Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Start production server:
   ```bash
   npm run start
   ```

5. Lint code:
   ```bash
   npm run lint
   ```

## Environment Variables
Create a `.env.local` file with:
```
BACKEND_URL=https://bjot-backend-nine.vercel.app/api
```

## Important Files and Directories
- `src/app/login/page.tsx` - Login page implementation
- `src/app/register/page.tsx` - Registration page with form validation
- `src/app/` - Next.js app router pages
- `src/types/` - TypeScript type definitions
- `public/` - Static assets
- `components/` - Reusable UI components (if any)
- `utils/` - Utility functions (if any)
- `hooks/` - Custom React hooks (if any)

## Coding Conventions
1. **TypeScript**: Use strict typing; avoid `any` when possible
2. **Components**: 
   - Use functional components with React hooks
   - Follow Next.js app router conventions
   - Use 'use client' directive for client-side components
3. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the existing design system (colors, spacing, etc.)
   - Maintain responsive design principles
4. **Forms**:
   - Implement proper validation
   - Show loading states during submissions
   - Provide clear error messages
   - Handle form resets appropriately
5. **API Calls**:
   - Use async/await for fetch requests
   - Handle errors gracefully with try/catch
   - Show loading states during requests
   - Validate API responses before use

## Common Tasks
### Adding New Pages
1. Create a new file in `src/app/` with appropriate route structure
2. Add 'use client' directive if it's a client component
3. Implement the component following existing patterns
4. Add navigation links as needed

### Modifying Forms
1. Update form state using useState hooks
2. Add validation logic in validate functions
3. Update error display components
4. Ensure proper loading states

### Working with Question Sets
1. Question sets are fetched from `/api/question-set` endpoint
2. Store in state using useState/useEffect
3. Allow selection of exactly 4 sets
4. Provide visual feedback on selection count

## Error Handling Patterns
1. **Form Validation**: 
   - Use useState for error objects/messages
   - Display errors near relevant form fields
   - Clear errors on user input

2. **API Errors**:
   - Use try/catch around fetch calls
   - Check response.ok status
   - Display user-friendly error messages
   - Log errors to console for debugging

3. **Loading States**:
   - Use useState boolean for loading flags
   - Disable submit buttons during loading
   - Show loading spinners or indicators

## Security Considerations
1. Never expose backend URLs or API keys in client-side code
2. Validate all inputs on both client and server (where applicable)
3. Use proper HTTP methods (GET, POST) for API calls
4. Handle authentication tokens securely (using cookies-next in this project)
5. Sanitize user data before displaying to prevent XSS

## Performance Tips
1. Use Next.js built-in optimization (Image component, font optimization)
2. Implement proper caching strategies for API calls
3. Minimize re-renders with useCallback and useMemo where beneficial
4. Optimize bundle size by importing only necessary icons/components
5. Use Next.js prefetching for navigation links

## Testing
While there may not be explicit tests in this project:
1. Test form validation with various input scenarios
2. Test API call success and error paths
3. Test responsive design on different screen sizes
4. Test loading states and user feedback mechanisms