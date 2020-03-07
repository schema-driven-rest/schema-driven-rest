export function validate_LoginRequest(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.username === null || model.username === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.username !== 'string') {
    return false;
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
export function validate_LoginResponse(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.authorized === null || model.authorized === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.authorized !== 'boolean') {
    return false;
  }
  fieldCount++;
  if (model.jwt === null || model.jwt === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.jwt !== 'string') {
    return false;
  }
  fieldCount++;
  if (!Array.isArray(model.details)) {
    return false;
  }
  for (let ind = 0; ind < model.details.length; ind++) {
    fieldCount++;
    if (typeof model.model.details[ind] !== 'string') {
      return false;
    }
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
export function validate_GetUserRequest(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.userId === null || model.userId === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.userId !== 'string') {
    return false;
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
export function validate_UserResponse(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.user === null || model.user === undefined) {
    return false;
  }
  fieldCount++;
  if (validate_UserModel(model.user)) {
    return false;
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
export function validate_UserModel(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.email === null || model.email === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.email !== 'string') {
    return false;
  }
  fieldCount++;
  if (model.eyeColor === null || model.eyeColor === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.eyeColor !== 'number') {
    return false;
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
export function validate_UpdateUserRequest(model: any) {
  let fieldCount = 0;
  fieldCount++;
  if (model.email === null || model.email === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.email !== 'string') {
    return false;
  }
  fieldCount++;
  if (model.eyeColor === null || model.eyeColor === undefined) {
    return false;
  }
  fieldCount++;
  if (typeof model.eyeColor !== 'number') {
    return false;
  }
  if (Object.keys(model).length !== fieldCount) return false;
}
