export const DelayLoading = (
  start_time,
  cb,
  delay_time = 400,
  limit_delay_time = 200
) => {
  const end_time = new Date().getTime();
  if (end_time - start_time < limit_delay_time) {
    setTimeout(() => {
      cb();
    }, delay_time);
  }
};
