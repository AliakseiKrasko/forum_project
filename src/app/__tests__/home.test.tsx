import React from "react";
import {screen} from "@testing-library/react";
import Home from "@/app/page";
import {renderWithProviders} from "../../../test/utils";

describe("Home page", () => {
    test("renders filter select", () => {
        renderWithProviders(<Home />);
        expect(
            screen.getByRole("combobox", { name: /filter by user/i })
        ).toBeInTheDocument();
        expect(screen.getByRole("option", { name: /all users/i })).toBeInTheDocument();
    });

    test("renders search input", () => {
        renderWithProviders(<Home />);
        expect(
            screen.getByRole("textbox", { name: /search posts/i })
        ).toBeInTheDocument();
    });

    test("renders create post form", () => {
        renderWithProviders(<Home />);
        expect(screen.getByRole("heading", { name: /create a post/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/post title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/write something/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    });

    test("renders post list (even if skeleton)", () => {
        renderWithProviders(<Home />);
        expect(screen.getByRole("list")).toBeInTheDocument();
        expect(screen.getAllByRole("listitem").length).toBeGreaterThan(0);
    });
});