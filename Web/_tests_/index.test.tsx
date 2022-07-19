import { render, screen } from '@testing-library/react';
import Home from '@pages/index';
import '@testing-library/jest-dom';

jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    };
  },
}));

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react');
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: {
      username: 'Test user',
      email: 'testing@test.com',
      admin: true,
      level: 2,
    },
  };
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(() => {
      return { data: mockSession, status: 'authenticated' };
    }),
  };
});

describe('Render Index Page', () => {
  beforeEach(async () => {
    const useRouter = jest.spyOn(require('next/router'), 'useRouter');
    useRouter.mockImplementation(() => ({
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
      },
      beforePopState: jest.fn(() => null),
      prefetch: jest.fn(() => null),
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Check for Manage Cards', async () => {
    const { container } = render(<Home />);

    expect(container).toMatchSnapshot();
    expect(screen.getByTestId('motion-box-asset')).toBeInTheDocument();
    expect(screen.getByTestId('motion-box-quiz')).toBeInTheDocument();
    expect(screen.getByTestId('motion-box-event')).toBeInTheDocument();
  });
});
