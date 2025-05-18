import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoanApplication from '../../components/loans/LoanApplication';
import { AuthProvider } from '../../context/AuthContext';
import { LoanProvider } from '../../context/LoanContext';
import userEvent from '@testing-library/user-event';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoanProvider>
          {component}
        </LoanProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('LoanApplication Component', () => {
  beforeEach(() => {
    window.localStorage.clear();
    // Set up authenticated state
    window.localStorage.setItem('token', 'mock-jwt-token');
  });

  test('renders loan application form', () => {
    renderWithProviders(<LoanApplication />);
    
    expect(screen.getByLabelText(/loan amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/purpose/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /apply/i })).toBeInTheDocument();
  });

  test('handles successful loan application', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Fill in the loan application form
    await userEvent.type(screen.getByLabelText(/loan amount/i), '5000');
    await userEvent.selectOptions(screen.getByLabelText(/duration/i), '12');
    await userEvent.type(screen.getByLabelText(/purpose/i), 'Business expansion');
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    
    // Wait for success message and loan ID
    await waitFor(() => {
      expect(screen.getByText(/loan application submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/loan id: mock-loan-id/i)).toBeInTheDocument();
    });
  });

  test('validates loan amount limits', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Try amount exceeding maximum limit
    await userEvent.type(screen.getByLabelText(/loan amount/i), '60000');
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/amount exceeds maximum loan limit/i)).toBeInTheDocument();
    });
  });

  test('handles document upload process', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Mock file upload
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByLabelText(/upload documents/i);
    
    await userEvent.upload(fileInput, file);
    
    await waitFor(() => {
      expect(screen.getByText(/document uploaded successfully/i)).toBeInTheDocument();
    });
  });

  test('displays loan application progress', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Submit basic application
    await userEvent.type(screen.getByLabelText(/loan amount/i), '5000');
    await userEvent.selectOptions(screen.getByLabelText(/duration/i), '12');
    await userEvent.type(screen.getByLabelText(/purpose/i), 'Test purpose');
    
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    
    // Check progress indicators
    await waitFor(() => {
      expect(screen.getByText(/application submitted/i)).toBeInTheDocument();
      expect(screen.getByText(/documents pending/i)).toBeInTheDocument();
    });
  });

  test('calculates and displays loan details', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Enter loan amount and duration
    await userEvent.type(screen.getByLabelText(/loan amount/i), '5000');
    await userEvent.selectOptions(screen.getByLabelText(/duration/i), '12');
    
    // Check if monthly payment and total repayment are calculated
    await waitFor(() => {
      expect(screen.getByText(/monthly payment/i)).toBeInTheDocument();
      expect(screen.getByText(/total repayment/i)).toBeInTheDocument();
    });
  });

  test('validates required fields', async () => {
    renderWithProviders(<LoanApplication />);
    
    // Submit empty form
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/amount is required/i)).toBeInTheDocument();
      expect(screen.getByText(/duration is required/i)).toBeInTheDocument();
      expect(screen.getByText(/purpose is required/i)).toBeInTheDocument();
    });
  });
});