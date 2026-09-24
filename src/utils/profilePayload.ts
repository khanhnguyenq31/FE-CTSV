import dayjs from 'dayjs';

const profileDateFields = ['dateOfBirth', 'idCardIssueDate', 'enrollmentDate', 'activityDate'];

type ProfileValues = Record<string, unknown>;

export function prepareProfilePayload(values: ProfileValues) {
  const data: ProfileValues = {};
  Object.keys(values).forEach((key) => {
    const value = values[key];
    if (typeof value !== 'object' || value === null || dayjs.isDayjs(value)) {
      data[key] = value;
    }
  });

  profileDateFields.forEach((field) => {
    const value = data[field];
    if (dayjs.isDayjs(value)) data[field] = value.format('YYYY-MM-DD');
  });

  return data;
}

export function createProfileFormData(data: ProfileValues, avatarFile: File) {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) formData.append(key, String(value));
  });
  formData.append('avatar', avatarFile);
  return formData;
}
