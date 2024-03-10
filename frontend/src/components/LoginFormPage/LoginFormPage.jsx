// // frontend/src/components/LoginFormPage/LoginFormPage.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import './LoginForm.css'; // Assuming you've added CSS

function LoginFormPage() {
  const dispatch = useDispatch();
  const sessionUser = useSelector((state) => state.session.user);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  if (sessionUser) return <Navigate to="/" replace={true} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      await dispatch(sessionActions.login({ credential, password }));
    } catch (error) {
      const errorData = await error.json();
      if (errorData.message) {
        setErrors({ message: errorData.message });
      } else if (errorData.errors) {
        setErrors(errorData.errors);
      } else {
        setErrors({});
      }
    }
  };

  return (
    <>
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <div>
          {errors.message && <div className="error">{errors.message}</div>}
        </div>
        <div>
          {errors.credential && (
            <div className="error">{errors.credential}</div>
          )}
          {errors.password && <div className="error">{errors.password}</div>}
        </div>
        <label>
          Username or Email
          <input
            type="text"
            value={credential}
            onChange={(e) => setCredential(e.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit">Log In</button>
      </form>
    </>
  );
}
export default LoginFormPage;
