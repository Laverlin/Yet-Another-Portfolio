import '@testing-library/jest-dom'; // eslint-disable-line
import { render } from '@testing-library/react';
import { Main } from 'renderer/control/Main';

describe('App', () => {
  it('should render', () => {
    expect(render(<Main />)).toBeTruthy();
  });
});
