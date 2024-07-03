import { useEffect, useState } from "react";
import Header from "./components/Header";
import SearchItem from "./components/SearchItem";
import AddItem from "./components/AddItem";
import Content from "./components/Content";
import Footer from "./components/Footer";
import { ClipLoader } from "react-spinners";

function App() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newItem, setNewItem] = useState("");
  const [search, setSearch] = useState("");
  const [fetchError, setFetchError] = useState(null);

  const api_url = "http://localhost:3000";

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(`${api_url}/items`);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Network error was not ok: ${errorText}`);
        }

        const newItems = await response.json();
        setItems(newItems);
      } catch (error) {
        console.error("Error fetching items", error);
        setFetchError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    setTimeout(() => {
      fetchItems();
    }, 2000);
  }, []);

  const handleAdd = async () => {
    const id = items.length + 1;
    const item = {
      id,
      item: newItem,
      checked: false,
    };

    try {
      const response = await fetch(`${api_url}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      setNewItem("");
      // Refetch items to update the list
      const fetchItems = await fetch(`${api_url}/items`);
      const newItems = await fetchItems.json();
      setItems(newItems);
    } catch (error) {
      console.error("Error creating new item:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${api_url}/items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      // Refetch items to update the list
      const fetchItems = await fetch(`${api_url}/items`);
      const newItems = await fetchItems.json();
      setItems(newItems);
    } catch (error) {
      console.error("Error deleting item:", error.message);
    }
  };

  const handleCheck = async (id) => {
    const itemToCheck = items.find((item) => item.id === id);
    const updatedItem = { ...itemToCheck, checked: !itemToCheck.checked };

    try {
      const response = await fetch(`${api_url}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Network response was not ok: ${errorText}`);
      }

      // Refetch items to update the list
      const fetchItems = await fetch(`${api_url}/items`);
      const newItems = await fetchItems.json();
      setItems(newItems);
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAdd();
  };

  return (
    <div className="App">
      <Header title="Grocery List" />
      <AddItem
        newItem={newItem}
        setNewItem={setNewItem}
        handleSubmit={handleSubmit}
      />
      <SearchItem search={search} setSearch={setSearch} />
      <main>
        {isLoading && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ClipLoader color={"#123abc"} loading={isLoading} size={75} />
            <span>Loading...</span>
          </div>
        )}
        {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
        {!isLoading && !fetchError && (
          <Content
            items={items.filter((item) =>
              item.item.toLowerCase().includes(search.toLowerCase())
            )}
            handleCheck={handleCheck}
            handleDelete={handleDelete}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
