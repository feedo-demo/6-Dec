import Subscription from './backend/pages/Subscription/Subscription';

const AppRoutes = () => {
  return (
    <Routes>
      {/* ... other routes */}
      <Route path="/subscription" element={<Subscription />} />
    </Routes>
  );
};

export default AppRoutes; 