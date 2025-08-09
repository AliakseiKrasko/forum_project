import React from "react";
import { ReactElement } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "@/store/store";

export function renderWithProviders(ui: ReactElement) {
    return render(<Provider store={store}>{ui}</Provider>);
}