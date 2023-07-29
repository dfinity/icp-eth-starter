export const idlFactory = ({ IDL }) => {
  return IDL.Service({ 'hello' : IDL.Func([], [IDL.Nat], ['query']) });
};
export const init = ({ IDL }) => { return []; };
