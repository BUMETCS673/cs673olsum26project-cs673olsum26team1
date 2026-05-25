jest.mock('../src/config/firebase', () => ({
  auth: {},
  signOut: jest.fn(),
}));

jest.mock('../src/context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null }),
}));
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import BMICalculationPage from '../src/pages/BMICalculationPage';


// mock navigate
const mockedNavigate = jest.fn();

// mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),

  useNavigate: () => mockedNavigate,

  useLocation: () => ({
    state: {
      name: 'Kai',
    },
  }),
}));

// mock alert
window.alert = jest.fn();

describe('BMICalculationPage', () => {

  test('navigates to patient portal when BMI > 27', async () => {

    render(
      <MemoryRouter>
        <BMICalculationPage />
      </MemoryRouter>
    );

    // find inputs
    const heightInput = screen.getByPlaceholderText('Height (inches)');
    const weightInput = screen.getByPlaceholderText('Weight (pounds)');

    // type values
    await userEvent.type(heightInput, '70');
    await userEvent.type(weightInput, '250');

    // click button
    const button = screen.getByText('Calculate BMI');

    await userEvent.click(button);

    // check navigation
    expect(mockedNavigate).toHaveBeenCalledWith(
      '/patient/portal',
      expect.objectContaining({
        state: expect.objectContaining({
          bmi: expect.any(String),
        }),
      })
    );
  });

});