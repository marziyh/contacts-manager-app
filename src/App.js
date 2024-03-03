import { useEffect, useState } from "react";
import {
  COMMENT,
  YELLOW,
  PURPLE,
  CURRENTLINE,
  FOREGROUND,
} from "./helpers/colors";
import "./App.css";
import {
  Navbar,
  Contacts,
  AddContact,
  EditContact,
  ViewContact,
} from "./components";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import {
  createContact,
  deleteContact,
  getAllContacts,
  getAllGroups,
} from "./services/contactsServices";
import { confirmAlert } from "react-confirm-alert";
import { ContactContext } from "./context/contactContext";
import _ from "lodash";
import { ToastContainer, toast } from "react-toastify";
function App() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [groups, setGroups] = useState([]);

  const navigator = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: contacts } = await getAllContacts();
        const { data: groups } = await getAllGroups();
        setContacts(contacts);
        setFilteredContacts(contacts);
        setGroups(groups);
        setLoading(false);
      } catch (err) {
        console.log(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const createContactForm = async (values) => {
    try {
      setLoading((prevLoading) => !prevLoading);
      const { status, data } = await createContact(values);

      if (status === 201) {
        const allContacts = [...contacts, data];
        setContacts(allContacts);
        setFilteredContacts(allContacts);
        setLoading((prevLoading) => !prevLoading);
        navigator("/");
        toast.success("مخاطب با موفقیت اضافه شد.");
      }
    } catch (err) {
      console.log(err.message);
      setLoading(false);
    }
  };
  const removeContact = async (contactId) => {
    const allContacts = [...contacts];
    try {
      setLoading(true);
      const changeContact = contacts.filter(
        (c) => c.id !== parseInt(contactId)
      );
      setContacts(changeContact);
      setFilteredContacts(changeContact);
      const { status } = await deleteContact(contactId);
      if (status !== 200) {
        setContacts(allContacts);
        setFilteredContacts(allContacts);

        setLoading(false);
      } else {
        setLoading(false);
        toast.success("مخاطب با موفقیت پاک شد.");
      }
    } catch (err) {
      console.log(err.message);
      setContacts(allContacts);
      setFilteredContacts(allContacts);
      setLoading(false);
    }
  };
  const confirmDelete = (contactId, contactFullname) => {
    confirmAlert({
      customUI: ({ onClose }) => {
        return (
          <div
            dir="rtl"
            style={{
              backgroundColor: CURRENTLINE,
              border: `1px solid ${PURPLE}`,
              borderRadius: "1em",
            }}
            className="p-4"
          >
            <h1 style={{ color: YELLOW }}>پاک کردن مخاطب</h1>
            <p style={{ color: FOREGROUND }}>
              مطمئنی که میخوای مخاطب {contactFullname} رو پاک کنی ؟
            </p>
            <button
              onClick={() => {
                removeContact(contactId);
                onClose();
              }}
              className="btn mx-2"
              style={{ backgroundColor: PURPLE }}
            >
              مطمئن هستم
            </button>
            <button
              onClick={onClose}
              className="btn"
              style={{ backgroundColor: COMMENT }}
            >
              انصراف
            </button>
          </div>
        );
      },
    });
  };
 
  const searchContact = _.debounce((query) => {
   
    if (!query) return setFilteredContacts(contacts);
   
    setFilteredContacts(
      contacts.filter((contact) => {
        return contact.fullname.toLowerCase().includes(query.toLowerCase());
      })
    );
 
  }, 1000);
  return (
    <ContactContext.Provider
      value={{
        loading,
        setLoading,
        setContacts,
        filteredContacts,
        setFilteredContacts,
        contacts,
        groups,
        deleteContact: confirmDelete,
        createContact: createContactForm,
        searchContact,
      }}
    >
      <div className="App">
        <ToastContainer rtl={true} theme="dark"  />
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/contacts" />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/contacts/:contactId" element={<ViewContact />} />
          <Route path="/contacts/add" element={<AddContact />} />
          <Route path="/contacts/edit/:contactId" element={<EditContact />} />
        </Routes>
      </div>
    </ContactContext.Provider>
  );
}

export default App;
