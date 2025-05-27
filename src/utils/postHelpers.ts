export function getExcerpt(
  htmlContent: string,
  maxLength: number = 150
): string {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;

  const plainText = tempDiv.textContent || tempDiv.innerText || "";

  if (plainText.length > maxLength) {
    return plainText.substring(0, maxLength).trim() + "...";
  }
  return plainText;
}

export function getFirstImageUrl(htmlContent: string): string | null {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = htmlContent;
  const imgElement = tempDiv.querySelector("img");
  return imgElement ? imgElement.src : null;
}
