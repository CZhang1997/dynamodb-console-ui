import { render, screen } from '@testing-library/react';
import App from './App';

test("renders the DynamoDB console home page", () => {
  render(<App />);
  expect(
    screen.getByRole("heading", { name: "DynamoDB Console UI" })
  ).toBeInTheDocument();
});
