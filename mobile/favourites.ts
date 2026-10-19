// UC-13: the ids of the favourite messages, in the order they were added.
export function toggleFavourite(favourites: number[], id: number): number[] {
  return favourites.includes(id) ? favourites.filter((favourite) => favourite !== id) : [...favourites, id];
}
