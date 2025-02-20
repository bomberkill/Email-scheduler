import { createBrowserRouter, RouterProvider } from 'react-router-dom';
// import { HomePage } from './pages/Home.page';
import EmailScheduler from './pages/EmailSchedule.page';

const router = createBrowserRouter([
  {
    path: '/',
    element: <EmailScheduler />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
