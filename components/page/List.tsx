type Props = {
  list: any[];
};

const List: React.FC<Props> = ({ list }) => {
  return (
    <ul className="space-y-2">
      {list.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
};

export default List;

export const renderList = (
  items: any[],
  Component: React.ComponentType<{ info: any }>
) => {
  return items.map((item) => <Component info={item} />);
};
