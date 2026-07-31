export const GRID_SIZE = 20;

export const DIRECTIONS = {
  UP: { row: -1, col: 0 },
  DOWN: { row: 1, col: 0 },
  LEFT: { row: 0, col: -1 },
  RIGHT: { row: 0, col: 1 },
};

// Empêche de faire un demi-tour direct sur soi-même (ex: aller à droite puis à gauche instantanément)
export function isOppositeDirection(dir1, dir2) {
  return dir1.row === -dir2.row && dir1.col === -dir2.col;
}

export function getInitialSnake() {
  const center = Math.floor(GRID_SIZE / 2);
  return [
    { row: center, col: center },
    { row: center, col: center - 1 },
    { row: center, col: center - 2 },
  ];
}

export function getRandomFoodPosition(snake) {
  let position;
  do {
    position = {
      row: Math.floor(Math.random() * GRID_SIZE),
      col: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((segment) => segment.row === position.row && segment.col === position.col));
  return position;
}

export function getNextHead(head, direction) {
  return { row: head.row + direction.row, col: head.col + direction.col };
}

export function isOutOfBounds(position) {
  return (
    position.row < 0 ||
    position.row >= GRID_SIZE ||
    position.col < 0 ||
    position.col >= GRID_SIZE
  );
}

export function isSelfCollision(snake, position) {
  return snake.some((segment) => segment.row === position.row && segment.col === position.col);
}

export const SPEED_BY_LEVEL = {
  lent: 180,
  normal: 120,
  rapide: 80,
};