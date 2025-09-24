const express = require("express");
const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// In-memory card collection
let cards = [];
let nextId = 1;

// 1. GET all cards
app.get("/cards", (req, res) => {
  res.json({
    success: true,
    count: cards.length,
    data: cards,
  });
});

// 2. POST a new card
app.post("/cards", (req, res) => {
  const { suit, value } = req.body;

  if (!suit || !value) {
    return res.status(400).json({
      success: false,
      message: "Both 'suit' and 'value' are required",
    });
  }

  const newCard = { id: nextId++, suit, value };
  cards.push(newCard);

  res.status(201).json({
    success: true,
    message: "Card added successfully",
    data: newCard,
  });
});

// 3. GET a specific card by ID
app.get("/cards/:id", (req, res) => {
  const cardId = parseInt(req.params.id);
  const card = cards.find((c) => c.id === cardId);

  if (!card) {
    return res.status(404).json({
      success: false,
      message: `Card with id ${cardId} not found`,
    });
  }

  res.json({
    success: true,
    data: card,
  });
});

// 4. DELETE a card by ID
app.delete("/cards/:id", (req, res) => {
  const cardId = parseInt(req.params.id);
  const cardIndex = cards.findIndex((c) => c.id === cardId);

  if (cardIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Card with id ${cardId} not found`,
    });
  }

  const deletedCard = cards.splice(cardIndex, 1);

  res.json({
    success: true,
    message: "Card deleted successfully",
    data: deletedCard[0],
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
