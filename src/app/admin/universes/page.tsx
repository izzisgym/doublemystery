"use client";

import { useState, useEffect, useCallback } from "react";

interface Item {
  id: string;
  name: string;
  rarity: string;
  imageUrl?: string | null;
}

interface Box {
  id: string;
  name: string;
  img: string;
  items: Item[];
  _count: { items: number };
}

interface Universe {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  color: string;
  gradient: string;
  boxes: Box[];
  _count: { boxes: number };
}

const inputStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  fontFamily: "'Nunito', sans-serif",
  outline: "none",
  width: "100%",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 20px",
  borderRadius: 10,
  border: "none",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  fontFamily: "'Nunito', sans-serif",
};

export default function UniversesPage() {
  const [universes, setUniverses] = useState<Universe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedUniverse, setExpandedUniverse] = useState<string | null>(null);
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  // New universe form
  const [showNewUniverse, setShowNewUniverse] = useState(false);
  const [newUniverse, setNewUniverse] = useState({ name: "", slug: "", emoji: "", color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)" });

  // New box form
  const [addingBoxTo, setAddingBoxTo] = useState<string | null>(null);
  const [newBox, setNewBox] = useState({ name: "", img: "" });

  // New item form
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    rarity: "standard",
    imageUrl: "",
  });

  const fetchUniverses = useCallback(() => {
    fetch("/api/admin/universes")
      .then((r) => r.json())
      .then((data) => {
        setUniverses(data.universes || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetchUniverses();
  }, [fetchUniverses]);

  // --- Universe CRUD ---
  const createUniverse = async () => {
    if (!newUniverse.name || !newUniverse.slug || !newUniverse.emoji) return;
    await fetch("/api/admin/universes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUniverse),
    });
    setNewUniverse({ name: "", slug: "", emoji: "", color: "#FF6B6B", gradient: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)" });
    setShowNewUniverse(false);
    fetchUniverses();
  };

  const deleteUniverse = async (id: string) => {
    if (!confirm("Delete this universe and all its boxes/items?")) return;
    await fetch(`/api/admin/universes?id=${id}`, { method: "DELETE" });
    fetchUniverses();
  };

  // --- Box CRUD ---
  const createBox = async (universeId: string) => {
    if (!newBox.name || !newBox.img) return;
    await fetch("/api/admin/boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newBox, universeId }),
    });
    setNewBox({ name: "", img: "" });
    setAddingBoxTo(null);
    fetchUniverses();
  };

  const deleteBox = async (id: string) => {
    if (!confirm("Delete this box and all its items?")) return;
    await fetch(`/api/admin/boxes?id=${id}`, { method: "DELETE" });
    fetchUniverses();
  };

  // --- Item CRUD ---
  const createItem = async (boxId: string) => {
    if (!newItem.name) return;
    await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newItem, boxId }),
    });
    setNewItem({ name: "", rarity: "standard", imageUrl: "" });
    setAddingItemTo(null);
    fetchUniverses();
  };

  const deleteItem = async (id: string) => {
    await fetch(`/api/admin/items?id=${id}`, { method: "DELETE" });
    fetchUniverses();
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.3)", padding: 40, textAlign: "center" }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: "'Fredoka', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>
            Universes
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "4px 0 0" }}>
            Manage your blind box universes, boxes, and items
          </p>
        </div>
        <button
          onClick={() => setShowNewUniverse(!showNewUniverse)}
          style={{
            ...btnStyle,
            background: "linear-gradient(135deg, #FF6B6B 0%, #FFD93D 100%)",
            color: "#000",
          }}
        >
          + New Universe
        </button>
      </div>

      {/* New Universe Form */}
      {showNewUniverse && (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: "24px",
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "rgba(255,255,255,0.6)" }}>
            Create New Universe
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <input
              style={inputStyle}
              placeholder="Name (e.g. Pokémon)"
              value={newUniverse.name}
              onChange={(e) => setNewUniverse((u) => ({ ...u, name: e.target.value }))}
            />
            <input
              style={inputStyle}
              placeholder="Slug (e.g. pokemon)"
              value={newUniverse.slug}
              onChange={(e) => setNewUniverse((u) => ({ ...u, slug: e.target.value }))}
            />
            <input
              style={inputStyle}
              placeholder="Emoji (e.g. ⚡)"
              value={newUniverse.emoji}
              onChange={(e) => setNewUniverse((u) => ({ ...u, emoji: e.target.value }))}
            />
            <input
              style={inputStyle}
              placeholder="Color hex (e.g. #FFCB05)"
              value={newUniverse.color}
              onChange={(e) => setNewUniverse((u) => ({ ...u, color: e.target.value }))}
            />
          </div>
          <input
            style={{ ...inputStyle, marginBottom: 16 }}
            placeholder="CSS gradient (e.g. linear-gradient(135deg, #FFCB05 0%, #FF6B35 100%))"
            value={newUniverse.gradient}
            onChange={(e) => setNewUniverse((u) => ({ ...u, gradient: e.target.value }))}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={createUniverse} style={{ ...btnStyle, background: "#6BCB77", color: "#000" }}>
              Create Universe
            </button>
            <button onClick={() => setShowNewUniverse(false)} style={{ ...btnStyle, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Universe List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {universes.map((universe) => (
          <div
            key={universe.id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Universe Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                cursor: "pointer",
                borderLeft: `4px solid ${universe.color}`,
              }}
              onClick={() => setExpandedUniverse(expandedUniverse === universe.id ? null : universe.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: universe.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                  }}
                >
                  {universe.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{universe.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                    {universe._count.boxes} boxes &middot; slug: {universe.slug}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteUniverse(universe.id); }}
                  style={{ ...btnStyle, background: "rgba(230,57,70,0.15)", color: "#E63946", padding: "6px 12px", fontSize: 12 }}
                >
                  Delete
                </button>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 18 }}>
                  {expandedUniverse === universe.id ? "▾" : "▸"}
                </span>
              </div>
            </div>

            {/* Expanded Boxes */}
            {expandedUniverse === universe.id && (
              <div style={{ padding: "0 24px 20px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0 12px" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Boxes
                  </span>
                  <button
                    onClick={() => { setAddingBoxTo(addingBoxTo === universe.id ? null : universe.id); setNewBox({ name: "", img: "" }); }}
                    style={{ ...btnStyle, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", padding: "6px 14px", fontSize: 12 }}
                  >
                    + Add Box
                  </button>
                </div>

                {addingBoxTo === universe.id && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                    <input style={{ ...inputStyle, flex: 1 }} placeholder="Box name" value={newBox.name} onChange={(e) => setNewBox((b) => ({ ...b, name: e.target.value }))} />
                    <input style={{ ...inputStyle, width: 80 }} placeholder="Emoji" value={newBox.img} onChange={(e) => setNewBox((b) => ({ ...b, img: e.target.value }))} />
                    <button onClick={() => createBox(universe.id)} style={{ ...btnStyle, background: "#6BCB77", color: "#000", whiteSpace: "nowrap" }}>Add</button>
                  </div>
                )}

                {universe.boxes.length === 0 ? (
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "12px 0" }}>
                    No boxes yet. Add one above.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {universe.boxes.map((box) => (
                      <div key={box.id}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "12px 16px",
                            background: "rgba(255,255,255,0.03)",
                            borderRadius: 10,
                            cursor: "pointer",
                          }}
                          onClick={() => setExpandedBox(expandedBox === box.id ? null : box.id)}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 20 }}>{box.img}</span>
                            <div>
                              <span style={{ fontSize: 14, fontWeight: 600 }}>{box.name}</span>
                              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: 8 }}>
                                {box._count.items} items
                              </span>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteBox(box.id); }}
                              style={{ background: "none", border: "none", color: "rgba(230,57,70,0.6)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                            >
                              Delete
                            </button>
                            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 14 }}>
                              {expandedBox === box.id ? "▾" : "▸"}
                            </span>
                          </div>
                        </div>

                        {/* Expanded Items */}
                        {expandedBox === box.id && (
                          <div style={{ padding: "8px 0 4px 36px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "1px" }}>
                                Items
                              </span>
                              <button
                                onClick={() => {
                                  setAddingItemTo(addingItemTo === box.id ? null : box.id);
                                  setNewItem({ name: "", rarity: "standard", imageUrl: "" });
                                }}
                                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
                              >
                                + Add Item
                              </button>
                            </div>

                            {addingItemTo === box.id && (
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 120px auto", gap: 8, marginBottom: 8 }}>
                                <input style={{ ...inputStyle, padding: "8px 12px", fontSize: 13 }} placeholder="Item name" value={newItem.name} onChange={(e) => setNewItem((i) => ({ ...i, name: e.target.value }))} />
                                <select
                                  style={{ ...inputStyle, width: 120, padding: "8px 12px", fontSize: 13 }}
                                  value={newItem.rarity}
                                  onChange={(e) => setNewItem((i) => ({ ...i, rarity: e.target.value }))}
                                >
                                  <option value="standard">Standard</option>
                                  <option value="rare">Rare</option>
                                  <option value="ultra_rare">Ultra Rare</option>
                                </select>
                                <button onClick={() => createItem(box.id)} style={{ ...btnStyle, background: "#6BCB77", color: "#000", padding: "8px 14px", fontSize: 12 }}>Add</button>
                              </div>
                            )}
                            {addingItemTo === box.id && (
                              <input
                                style={{ ...inputStyle, padding: "8px 12px", fontSize: 13, marginBottom: 8 }}
                                placeholder="Optional image URL (https://...)"
                                value={newItem.imageUrl}
                                onChange={(e) =>
                                  setNewItem((i) => ({ ...i, imageUrl: e.target.value }))
                                }
                              />
                            )}

                            {box.items.length === 0 ? (
                              <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, padding: "4px 0" }}>
                                No items yet.
                              </div>
                            ) : (
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {box.items.map((item) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      padding: "8px 12px",
                                      background: "rgba(255,255,255,0.02)",
                                      borderRadius: 8,
                                    }}
                                  >
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                      {item.imageUrl ? (
                                        <img
                                          src={item.imageUrl}
                                          alt={item.name}
                                          style={{
                                            width: 22,
                                            height: 22,
                                            objectFit: "cover",
                                            borderRadius: 4,
                                            border: "1px solid rgba(255,255,255,0.1)",
                                          }}
                                        />
                                      ) : (
                                        <span style={{ fontSize: 12 }}>🌟</span>
                                      )}
                                      <span style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</span>
                                      {item.rarity !== "standard" && (
                                        <span
                                          style={{
                                            fontSize: 10,
                                            padding: "2px 8px",
                                            borderRadius: 6,
                                            background: item.rarity === "ultra_rare" ? "rgba(123,47,247,0.2)" : "rgba(255,203,5,0.2)",
                                            color: item.rarity === "ultra_rare" ? "#7B2FF7" : "#FFCB05",
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                          }}
                                        >
                                          {item.rarity.replace("_", " ")}
                                        </span>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => deleteItem(item.id)}
                                      style={{ background: "none", border: "none", color: "rgba(230,57,70,0.5)", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
                                    >
                                      Remove
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
