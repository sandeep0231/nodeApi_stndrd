const asyncHandler = (reqHandler) => {
  return (req, res, next) => {
    Promise.resolve(reqHandler(req, res, next)).catch((error) => next(error));
  };
};
export { asyncHandler };

// const asyncHandler = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (error) {
//     res.status(err.code||500).json({
//         error: err.message || 'An error',
//         success:false,
//         message:err.message
//     })
//   }
// };
