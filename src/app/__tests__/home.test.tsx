import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("renders filter select", () => {
    render(<Home />);
    expect(screen.getByText(/Все пользователи/)).toBeInTheDocument();
});