const Card = ({ value }: { value: string }) => (
  <div className="w-16 h-24 bg-white border-2 border-yellow-400 rounded-lg flex items-center justify-center text-2xl font-bold text-black m-1">
    {value}
  </div>
);

export { Card };
