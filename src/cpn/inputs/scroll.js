import { components } from "react-select";

const InfiniteMenuList = (props) => {
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight) {
      // console.log("Reached bottom of list");
      if (props.onBottomReached) {
        props.onBottomReached();
      }
    }
  };

  return (
    <components.MenuList {...props} onScroll={handleScroll}>
      {props.children}
    </components.MenuList>
  );
};

export default InfiniteMenuList;
