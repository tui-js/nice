const Text = Nice({
  bg: "red",
  fg: "blue",
  padding: [2, 1, 2, 1],
  bold: true,
});

Tui(
  GridLayout([
    [Text("1"), Text("2"), Text("3")],
    [Text("4"), Text("5"), Text("6")],
    [Text("7"), Text("8"), Text("9")],
  ]),
);
