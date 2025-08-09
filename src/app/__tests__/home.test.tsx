import {screen} from "@testing-library/react";
import Home from "@/app/page";
import {renderWithProviders} from "../../../test/utils";

test("renders filter select", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(/Все пользователи/)).toBeInTheDocument();
});