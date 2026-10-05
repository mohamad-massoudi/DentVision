export function patientForResponse<T extends { images: Array<{ id: string; url: string }> }>(patient: T): T {
  return { ...patient, images: patient.images.map(image => ({ ...image, url: `/api/images/${image.id}` })) } as T;
}
