import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import PrivateLayout from "./components/PrivateLayout";

import AdminLogin from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CourseManagement from "./pages/CourseManagement";
import AssignLecturer from "./pages/AssignLecturer";
import CandidateReport from "./pages/CandidateReport";

function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={AdminLogin} />
        
        <PrivateLayout>
          <ProtectedRoute path="/dashboard" component={Dashboard} />
          <ProtectedRoute path="/course-management" component={CourseManagement} />
          <ProtectedRoute path="/assign-lecturer" component={AssignLecturer} />
          <ProtectedRoute path="/candidate-report" component={CandidateReport} />
        </PrivateLayout>
      </Switch>
    </Router>
  );
}

export default App;
