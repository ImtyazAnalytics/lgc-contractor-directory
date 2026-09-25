"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Building2,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  X,
  Edit3,
  Trash2,
  ExternalLink,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

type Trade = { id: string; name: string };
type Contact = {
  id: string;
  name: string;
  job_title: string | null;
  phone: string | null;
  email: string | null;
};
type Company = {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  website: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  company_trades: { trades: Trade }[];
  contacts: Contact[];
};
type ModalKind = "company" | "edit" | "contact" | "editContact" | "trade";

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]),
    [trades, setTrades] = useState<Trade[]>([]),
    [query, setQuery] = useState(""),
    [trade, setTrade] = useState("all"),
    [status, setStatus] = useState("Active"),
    [loading, setLoading] = useState(true),
    [modal, setModal] = useState<ModalKind | null>(null),
    [selected, setSelected] = useState<Company | null>(null),
    [selectedContact, setSelectedContact] = useState<Contact | null>(null),
    [notice, setNotice] = useState("");
  async function load() {
    setLoading(true);
    const [{ data: c }, { data: t }] = await Promise.all([
      supabase
        .from("companies")
        .select("*, contacts(*), company_trades(trades(*))")
        .order("name"),
      supabase.from("trades").select("*").order("name"),
    ]);
    setCompanies((c as Company[]) || []);
    setTrades(t || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);
  const shown = useMemo(
    () =>
      companies.filter((c) => {
        const hay = [
          c.name,
          c.city,
          c.state,
          c.website,
          c.notes,
          ...c.contacts.flatMap((x) => [x.name, x.email, x.phone, x.job_title]),
          ...c.company_trades.map((x) => x.trades.name),
        ]
          .join(" ")
          .toLowerCase();
        return (
          hay.includes(query.toLowerCase()) &&
          (trade === "all" ||
            c.company_trades.some((x) => x.trades.id === trade)) &&
          (status === "all" || c.status === status)
        );
      }),
    [companies, query, trade, status],
  );
  function open(
    kind: ModalKind,
    c: Company | null = null,
    contact: Contact | null = null,
  ) {
    setSelected(c);
    setSelectedContact(contact);
    setModal(kind);
  }
  async function removeCompany(c: Company) {
    if (!confirm(`Delete ${c.name}? This will also delete its contacts.`))
      return;
    const { error } = await supabase.from("companies").delete().eq("id", c.id);
    setNotice(error ? error.message : `${c.name} was deleted.`);
    if (!error) load();
  }
  async function removeContact(c: Contact) {
    if (!confirm(`Delete contact ${c.name}?`)) return;
    const { error } = await supabase.from("contacts").delete().eq("id", c.id);
    setNotice(error ? error.message : `${c.name} was deleted.`);
    if (!error) load();
  }
  async function removeTrade(t: Trade) {
    if (
      !confirm(
        `Delete the ${t.name} trade? Contractors and contacts will not be deleted.`,
      )
    )
      return;
    const { error } = await supabase.from("trades").delete().eq("id", t.id);
    setNotice(error ? error.message : `${t.name} trade was deleted.`);
    if (!error) {
      if (trade === t.id) setTrade("all");
      load();
    }
  }
  return (
    <main>
      <header>
        <div className="brand">
          <div className="logo">LGC</div>
          <div>
            <b>LGC GLOBAL</b>
            <span>Contractor Network</span>
          </div>
        </div>
        <div className="headerActions">
          <button className="primary" onClick={() => open("company")}>
            <Plus size={18} /> Add Contractor
          </button>
        </div>
      </header>
      <section className="hero">
        <div>
          <p className="eyebrow">LGC CONTRACTOR NETWORK</p>
          <h1>
            Your trusted field partners,
            <br />
            <em>all in one place.</em>
          </h1>
          <p>Search companies, specialties, and contacts in seconds.</p>
        </div>
        <div className="stats">
          <b>{companies.length}</b>
          <span>Companies</span>
          <b>{trades.length}</b>
          <span>Trades</span>
          <b>{companies.reduce((n, c) => n + c.contacts.length, 0)}</b>
          <span>Contacts</span>
        </div>
      </section>
      <section className="content">
        {notice && (
          <div className="notice">
            <CheckCircle2 size={18} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")}>×</button>
          </div>
        )}
        <div className="toolbar">
          <div className="search">
            <Search />
            <input
              placeholder="Search company, contact, phone, email, city or trade…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select value={trade} onChange={(e) => setTrade(e.target.value)}>
            <option value="all">All trades</option>
            {trades.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="tradePanel">
          <div className="tradePanelHead">
            <div>
              <span>Browse by trade</span>
              <b>Select a specialty to filter contractors</b>
            </div>
            <button className="textButton" onClick={() => open("trade")}>
              <Plus size={16} /> Add trade
            </button>
          </div>
          <div className="tradeChips">
            <button
              className={trade === "all" ? "tradeChip active" : "tradeChip"}
              onClick={() => setTrade("all")}
            >
              <Building2 /> All <span>{companies.length}</span>
            </button>
            {trades.map((t) => {
              const count = companies.filter((c) =>
                c.company_trades.some((x) => x.trades.id === t.id),
              ).length;
              return (
                <div
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  className={trade === t.id ? "tradeChip active" : "tradeChip"}
                  onClick={() => setTrade(t.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") setTrade(t.id);
                  }}
                >
                  <button
                    className="deleteTrade"
                    title={`Delete ${t.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrade(t);
                    }}
                  >
                    <Trash2 />
                  </button>
                  <b>{t.name}</b>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="sectionTitle directoryTitle">
          <div>
            <span>Directory</span>
            <h2>
              {trade === "all"
                ? "All companies"
                : trades.find((t) => t.id === trade)?.name}
            </h2>
          </div>
          <small>
            {shown.length} result{shown.length === 1 ? "" : "s"}
          </small>
        </div>
        {loading ? (
          <div className="empty">Loading directory…</div>
        ) : shown.length === 0 ? (
          <div className="empty">
            <Search />
            <h3>No contractors found</h3>
            <p>Try another search or add a new company.</p>
          </div>
        ) : (
          <div className="companyGrid">
            {shown.map((c) => (
              <article key={c.id} className="company">
                <div className="companyTop">
                  <div className="avatar">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3>{c.name}</h3>
                    <p>
                      <MapPin size={14} />
                      {[c.city, c.state].filter(Boolean).join(", ") ||
                        "Location not added"}
                    </p>
                  </div>
                  <span className={"status " + c.status.toLowerCase()}>
                    {c.status}
                  </span>
                </div>
                <div className="contacts">
                  <div className="contactHeading">
                    <b>Contacts</b>
                    <button onClick={() => open("contact", c)}>
                      <UserPlus size={14} /> Add contact
                    </button>
                  </div>
                  {c.contacts.map((x) => (
                    <div className="contactRow" key={x.id}>
                      <div className="contactIdentity">
                        <b>{x.name}</b>
                        <small>{x.job_title || "Contact"}</small>
                      </div>
                      <div className="contactInfo">
                        {x.phone && (
                          <a href={"tel:" + x.phone}>
                            <Phone /> <span>{x.phone}</span>
                          </a>
                        )}
                        {x.email && (
                          <a href={"mailto:" + x.email}>
                            <Mail /> <span>{x.email}</span>
                          </a>
                        )}
                      </div>
                      <div className="actions">
                        <button
                          title="Edit contact"
                          onClick={() => open("editContact", c, x)}
                        >
                          <Edit3 /> <span>Edit</span>
                        </button>
                        <button
                          className="danger"
                          title="Delete contact"
                          onClick={() => removeContact(x)}
                        >
                          <Trash2 /> <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                  {!c.contacts.length && (
                    <p className="noContacts">No contacts added yet.</p>
                  )}
                </div>
                <div className="tags">
                  {c.company_trades.map((x) => (
                    <span key={x.trades.id}>{x.trades.name}</span>
                  ))}
                </div>
                {c.website && (
                  <a
                    className="website"
                    href={
                      c.website.startsWith("http")
                        ? c.website
                        : `https://${c.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={13} /> Website
                  </a>
                )}
                {c.notes && <p className="notes">{c.notes}</p>}
                <p className="audit">
                  Added {new Date(c.created_at).toLocaleDateString()}
                </p>
                <div className="cardFooter">
                  <b>Manage contractor</b>
                  <div>
                    <button
                      title="Edit company"
                      onClick={() => open("edit", c)}
                    >
                      <Edit3 size={15} /> <span>Edit</span>
                    </button>
                    <button
                      className="danger"
                      title="Delete company"
                      onClick={() => removeCompany(c)}
                    >
                      <Trash2 size={15} /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      {modal && (
        <Modal
          title={
            modal === "company"
              ? "Add contractor"
              : modal === "edit"
                ? `Edit ${selected?.name}`
                : modal === "contact"
                  ? `Add contact to ${selected?.name}`
                  : modal === "editContact"
                    ? `Edit ${selectedContact?.name}`
                    : "Add trade"
          }
          close={() => setModal(null)}
        >
          <Form
            kind={modal}
            company={selected}
            contact={selectedContact}
            trades={trades}
            companies={companies}
            done={(m) => {
              setModal(null);
              setNotice(m);
              load();
            }}
            openExisting={(c) => open("contact", c)}
          />
        </Modal>
      )}
    </main>
  );
}

function Modal({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal">
        <div className="modalHead">
          <div>
            <span>LGC GLOBAL</span>
            <h2>{title}</h2>
          </div>
          <button onClick={close}>
            <X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Form({
  kind,
  company,
  contact,
  trades,
  companies,
  done,
  openExisting,
}: {
  kind: ModalKind;
  company: Company | null;
  contact: Contact | null;
  trades: Trade[];
  companies: Company[];
  done: (m: string) => void;
  openExisting: (c: Company) => void;
}) {
  const editing = kind === "edit";
  const editingContact = kind === "editContact";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [name, setName] = useState(editing ? company?.name || "" : "");
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(
        /\b(incorporated|corporation|company|limited|inc|corp|co|llc|ltd)\b/g,
        "",
      )
      .replace(/[^a-z0-9]/g, "");
  const duplicate =
    kind === "company" && name.length > 2
      ? companies.find((c) => norm(c.name) === norm(name))
      : undefined;
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const f = new FormData(e.currentTarget);
    try {
      if (kind === "company" || kind === "edit") {
        if (duplicate) {
          openExisting(duplicate);
          return;
        }
        const payload = {
          name,
          city: f.get("city"),
          state: f.get("state") || "MI",
          website: f.get("website"),
          notes: f.get("notes"),
          status: f.get("status") || "Active",
        };
        if (editing) {
          const { error } = await supabase
            .from("companies")
            .update(payload)
            .eq("id", company?.id);
          if (error) throw error;
          await supabase
            .from("company_trades")
            .delete()
            .eq("company_id", company?.id);
          const ids = f.getAll("trades");
          if (ids.length)
            await supabase
              .from("company_trades")
              .insert(
                ids.map((trade_id) => ({ company_id: company?.id, trade_id })),
              );
          done(`${name} was updated.`);
        } else {
          const { data: c, error } = await supabase
            .from("companies")
            .insert(payload)
            .select()
            .single();
          if (error) throw error;
          const ids = f.getAll("trades");
          if (ids.length)
            await supabase
              .from("company_trades")
              .insert(ids.map((trade_id) => ({ company_id: c.id, trade_id })));
          const cn = String(f.get("contact_name") || "").trim();
          if (cn)
            await supabase.from("contacts").insert({
              company_id: c.id,
              name: cn,
              job_title: f.get("job_title"),
              phone: f.get("phone"),
              email: f.get("email"),
            });
          done(`${name} was added.`);
        }
      }
      if (kind === "contact" || kind === "editContact") {
        const email = String(f.get("email") || "").trim() || null,
          phone = String(f.get("phone") || "").trim() || null;
        const exists = company?.contacts.some(
          (c) =>
            c.id !== contact?.id &&
            ((email && c.email?.toLowerCase() === email.toLowerCase()) ||
              (phone &&
                c.phone?.replace(/\D/g, "") === phone.replace(/\D/g, ""))),
        );
        if (exists)
          throw new Error(
            "This email or phone number already exists for this company.",
          );
        const payload = {
          company_id: company?.id,
          name: f.get("contact_name"),
          job_title: f.get("job_title"),
          phone,
          email,
        };
        const { error } = editingContact
          ? await supabase
              .from("contacts")
              .update(payload)
              .eq("id", contact?.id)
          : await supabase.from("contacts").insert(payload);
        if (error) throw error;
        done(
          editingContact
            ? `${String(f.get("contact_name"))} was updated.`
            : `Contact added to ${company?.name}.`,
        );
      }
      if (kind === "trade") {
        const { error } = await supabase.from("trades").insert({ name });
        if (error) throw error;
        done(`${name} trade was added.`);
      }
    } catch (x: any) {
      setError(x.message || "Unable to save. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  const selectedTrades = new Set(
    company?.company_trades.map((x) => x.trades.id) || [],
  );
  return (
    <form onSubmit={submit}>
      {error && <div className="formError">{error}</div>}
      {(kind === "company" || editing) && (
        <>
          <label>
            Company name *
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Metro Piping"
            />
          </label>
          {duplicate && (
            <div className="duplicate">
              <b>{duplicate.name} already exists.</b>
              <span>Duplicate companies cannot be added.</span>
              <button type="button" onClick={() => openExisting(duplicate)}>
                Add a contact instead
              </button>
            </div>
          )}
          <div className="two">
            <label>
              City
              <input
                name="city"
                defaultValue={company?.city || ""}
                placeholder="Detroit"
              />
            </label>
            <label>
              State
              <input name="state" defaultValue={company?.state || "MI"} />
            </label>
          </div>
          <div className="two">
            <label>
              Website
              <input
                name="website"
                defaultValue={company?.website || ""}
                placeholder="https://"
              />
            </label>
            <label>
              Status
              <select name="status" defaultValue={company?.status || "Active"}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </label>
          </div>
          <fieldset>
            <legend>Trades</legend>
            <div className="checks">
              {trades.map((t) => (
                <label key={t.id}>
                  <input
                    type="checkbox"
                    name="trades"
                    value={t.id}
                    defaultChecked={selectedTrades.has(t.id)}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </fieldset>
          {!editing && <h3 className="subhead">Primary contact (optional)</h3>}
        </>
      )}
      {kind === "trade" && (
        <label>
          Trade name *
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Traffic Control"
          />
        </label>
      )}
      {(kind === "contact" ||
        kind === "editContact" ||
        (kind === "company" && !editing)) && (
        <>
          <label>
            Contact name {(kind === "contact" || kind === "editContact") && "*"}
            <input
              required={kind === "contact" || kind === "editContact"}
              name="contact_name"
              defaultValue={contact?.name || ""}
              placeholder="Full name"
            />
          </label>
          <div className="two">
            <label>
              Job title
              <input
                name="job_title"
                defaultValue={contact?.job_title || ""}
                placeholder="Project Manager"
              />
            </label>
            <label>
              Phone
              <input
                name="phone"
                type="tel"
                defaultValue={contact?.phone || ""}
                placeholder="(248) 555-0100"
              />
            </label>
          </div>
          <label>
            Email
            <input
              name="email"
              type="email"
              defaultValue={contact?.email || ""}
              placeholder="name@company.com"
            />
          </label>
        </>
      )}
      {(kind === "company" || editing) && (
        <label>
          Notes
          <textarea
            name="notes"
            defaultValue={company?.notes || ""}
            placeholder="Capabilities, service area, certifications, or other notes"
          />
        </label>
      )}
      <button className="submit" disabled={busy || !!duplicate}>
        {busy
          ? "Saving…"
          : editing || editingContact
            ? "Save changes"
            : kind === "contact"
              ? "Add contact"
              : kind === "trade"
                ? "Add trade"
                : "Add contractor"}
      </button>
    </form>
  );
}
