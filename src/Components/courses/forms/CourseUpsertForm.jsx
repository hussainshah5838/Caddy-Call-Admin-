import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  MdAccessTime,
  MdMap,
  MdCalendarToday,
  MdKeyboardArrowDown,
  MdClose,
  MdAddAPhoto,
} from "react-icons/md";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import Field from "./Field";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// simple input/select styles to match your UI
const inputCls =
  "w-full rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0d3b2e]/70";
const selectCls =
  "w-full appearance-none rounded-md border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0d3b2e]/70";
const iconRightCls = "absolute right-3 top-1/2 -translate-y-1/2 text-gray-400";
const mapBtnCls =
  "inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50";

const DEFAULT_CENTER = [33.6844, 73.0479]; // Islamabad default

function parseLatLng(value = "") {
  if (!value) return null;

  const source = String(value).trim();
  const coordsMatch = source.match(
    /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/i
  );
  if (coordsMatch) {
    const lat = Number(coordsMatch[1]);
    const lng = Number(coordsMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  const mapsMatch = source.match(/maps\?q=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (mapsMatch) {
    const lat = Number(mapsMatch[1]);
    const lng = Number(mapsMatch[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }

  return null;
}

function normalizeHoles(holes) {
  if (!Array.isArray(holes)) return [];

  return holes
    .map((item, index) => {
      if (typeof item === "string") {
        return { hole: `Hole ${index + 1}`, coordinates: item, address: "" };
      }

      if (item && typeof item === "object") {
        return {
          hole:
            item.hole ||
            item.name ||
            item.title ||
            `Hole ${index + 1}`,
          coordinates:
            item.coordinates ||
            item.coordinate ||
            item.coords ||
            "",
          address: item.address || "",
        };
      }

      return { hole: `Hole ${index + 1}`, coordinates: "", address: "" };
    })
    .filter((item) => item.hole || item.coordinates);
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const totalMinutes = i * 30;
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const mm = String(minutes).padStart(2, "0");
  return `${hours12}:${mm} ${suffix}`;
});

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function MapClickHandler({ onSelect }) {
  useMapEvents({
    click: (e) => {
      onSelect?.(e.latlng);
    },
  });
  return null;
}

// tiny avatar group pill
function AvatarGroup({ srcs = [] }) {
  if (!srcs.length)
    return <span className="text-gray-400 text-sm">Select admins</span>;
  return (
    <div className="flex -space-x-2">
      {srcs.slice(0, 4).map((s, i) => (
        <img
          key={i}
          src={s}
          alt=""
          className="h-6 w-6 rounded-full border-2 border-white object-cover"
        />
      ))}
      {srcs.length > 4 && (
        <span className="h-6 w-6 rounded-full bg-gray-100 text-[11px] grid place-items-center border-2 border-white">
          +{srcs.length - 4}
        </span>
      )}
    </div>
  );
}

export default function CourseUpsertForm({
  mode = "create",
  value,
  adminOptions = [], // [{id, name, avatar}]
  showAssignedAdmins = true,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    name: "",
    location: "",
    status: "active", // active | maintenance
    hours: "6:00 AM to 10:00 AM",
    hoursFrom: "6:00 AM",
    hoursTo: "10:00 AM",
    map: "",
    mapCoordinates: null, // { lat, lng }
    dueDate: "",
    taxRate: "",
    deliveryFee: "",
    holes: [],
    admins: [], // array of avatar urls (or ids; up to you)
    photo: null, // File or URL
  });
  const [mapOpen, setMapOpen] = useState(false);
  const [mapTarget, setMapTarget] = useState({
    field: "location", // "location" | "map" | "holeCoordinates"
    holeIndex: null,
  });
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [pickedLocation, setPickedLocation] = useState(null); // {lat, lng, address}
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const hoursFromRef = React.useRef(null);
  const hoursToRef = React.useRef(null);
  const adminsDropdownRef = React.useRef(null);
  const photoInputRef = React.useRef(null);
  const [adminsOpen, setAdminsOpen] = useState(false);

  // preview for the circular photo
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    if (value) {
      const rawHours = String(value?.hours || "");
      const parts = rawHours
        .split(/\s*(?:to|-)\s*/i)
        .map((x) => x.trim())
        .filter(Boolean);

      setForm((f) => ({
        ...f,
        ...value,
        hoursFrom: value?.hoursFrom || parts[0] || "",
        hoursTo: value?.hoursTo || parts[1] || "",
        holes: normalizeHoles(value?.holes),
      }));
      setPhotoUrl(typeof value?.photo === "string" ? value.photo : "");
    }
  }, [value]);

  // cleanup object URL
  useEffect(() => {
    return () => {
      if (photoUrl && photoUrl.startsWith("blob:"))
        URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  useEffect(() => {
    if (!adminsOpen) return undefined;

    const onOutsideClick = (event) => {
      if (
        adminsDropdownRef.current &&
        !adminsDropdownRef.current.contains(event.target)
      ) {
        setAdminsOpen(false);
      }
    };

    document.addEventListener("mousedown", onOutsideClick);
    return () => document.removeEventListener("mousedown", onOutsideClick);
  }, [adminsOpen]);

  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Course" : "Add Courses";

  const onPickPhoto = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      // cleanup old blob if any
      if (photoUrl && photoUrl.startsWith("blob:"))
        URL.revokeObjectURL(photoUrl);
      setPhotoUrl(url);
      setForm((f) => ({ ...f, photo: file }));
    },
    [photoUrl]
  );

  const removePhoto = useCallback(() => {
    if (photoUrl && photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    setPhotoUrl("");
    setForm((f) => ({ ...f, photo: null }));
  }, [photoUrl]);

  const toggleAdmin = useCallback((opt) => {
    setForm((f) => {
      // using avatar string as id; change to opt.id if you prefer
      const key = opt.avatar;
      const set = new Set(f.admins);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return { ...f, admins: Array.from(set) };
    });
  }, []);

  const addHole = useCallback(() => {
    setForm((f) => {
      const currentHoles = Array.isArray(f.holes) ? f.holes : [];
      const nextIndex = currentHoles.length + 1;
      return {
        ...f,
        holes: [
          ...currentHoles,
          { hole: `Hole ${nextIndex}`, coordinates: "", address: "" },
        ],
      };
    });
  }, []);

  const updateHole = useCallback((index, field, fieldValue) => {
    setForm((f) => {
      const currentHoles = Array.isArray(f.holes) ? f.holes : [];
      const nextHoles = currentHoles.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: fieldValue } : item
      );
      return { ...f, holes: nextHoles };
    });
  }, []);

  const removeHole = useCallback((index) => {
    setForm((f) => {
      const currentHoles = Array.isArray(f.holes) ? f.holes : [];
      const nextHoles = currentHoles.filter((_, itemIndex) => itemIndex !== index);
      return { ...f, holes: nextHoles };
    });
  }, []);

  const canSubmit = useMemo(
    () => form.name.trim() && form.location.trim(),
    [form.name, form.location]
  );

  const syncFormWithPickedLocation = useCallback((location, target) => {
    if (!location || !target?.field) return;

    const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const holeCoordinates = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;

    setForm((f) => {
      if (target.field === "holeCoordinates") {
        const currentHoles = Array.isArray(f.holes) ? f.holes : [];
        const nextHoles = currentHoles.map((item, itemIndex) =>
          itemIndex === target.holeIndex
            ? { ...item, coordinates: holeCoordinates, address: location.address || "" }
            : item
        );
        return { ...f, holes: nextHoles };
      }

      return {
        ...f,
        location: target.field === "location" ? location.address : f.location,
        map: target.field === "map" ? mapUrl : f.map,
        mapCoordinates: { lat: location.lat, lng: location.lng },
      };
    });
  }, []);

  const reverseGeocode = useCallback(async ({ lat, lng }) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );
      const data = await response.json().catch(() => ({}));
      return data?.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  }, []);

  const onMapClickSelect = useCallback(
    async (latlng) => {
      const lat = Number(latlng?.lat);
      const lng = Number(latlng?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const address = await reverseGeocode({ lat, lng });
      const selected = { lat, lng, address };
      setPickedLocation(selected);
      syncFormWithPickedLocation(selected, mapTarget); // reflect only target field
      setMapCenter([lat, lng]);
    },
    [reverseGeocode, syncFormWithPickedLocation, mapTarget]
  );

  const runSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=5`
      );
      const data = await response.json().catch(() => []);
      const rows = Array.isArray(data) ? data : [];
      setSearchResults(rows);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const openMapPicker = useCallback((targetField = "location", holeIndex = null) => {
    const nextTarget = { field: targetField, holeIndex };
    setMapTarget(nextTarget);
    setMapOpen(true);

    if (targetField === "holeCoordinates" && Number.isInteger(holeIndex)) {
      const holeValue = form.holes?.[holeIndex]?.coordinates || "";
      setSearchQuery(holeValue);
      const parsed = parseLatLng(holeValue);
      if (parsed) {
        setMapCenter([parsed.lat, parsed.lng]);
        setPickedLocation({
          lat: parsed.lat,
          lng: parsed.lng,
          address: `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`,
        });
      } else {
        setMapCenter(DEFAULT_CENTER);
        setPickedLocation(null);
      }
      return;
    }

    if (targetField === "location" && form.location) {
      setSearchQuery(form.location);
    } else if (targetField === "map" && form.map) {
      setSearchQuery(form.map);
    } else {
      setSearchQuery("");
    }
    if (form.mapCoordinates?.lat && form.mapCoordinates?.lng) {
      setMapCenter([form.mapCoordinates.lat, form.mapCoordinates.lng]);
      setPickedLocation({
        lat: form.mapCoordinates.lat,
        lng: form.mapCoordinates.lng,
        address: form.location || "",
      });
    } else {
      setMapCenter(DEFAULT_CENTER);
      setPickedLocation(null);
    }
  }, [form.location, form.map, form.mapCoordinates, form.holes]);

  const applyPickedLocation = useCallback(() => {
    if (pickedLocation) {
      syncFormWithPickedLocation(pickedLocation, mapTarget);
    }
    setMapOpen(false);
    setSearchResults([]);
  }, [pickedLocation, syncFormWithPickedLocation, mapTarget]);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <h1 className="text-[22px] font-semibold text-gray-900 mb-6">{title}</h1>
      {/* Photo circle */}
      <div className="md:col-span-3">
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          className="relative w-28 h-28 cursor-pointer rounded-full border-2 border-[#0d3b2e] grid place-items-center overflow-hidden"
          title="Upload photo"
        >
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt="Course"
                className="h-full w-full object-cover"
              />
              <button
                onClick={removePhoto}
                className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-gray-200 grid place-items-center shadow"
                title="Remove"
              >
                <MdClose className="text-gray-600" />
              </button>
            </>
          ) : (
            <div className="text-center">
              <MdAddAPhoto className="mx-auto h-6 w-6 text-gray-500" />
              <div className="text-[12px] text-gray-700 font-medium mt-1">
                Photo
              </div>
            </div>
          )}
        </button>

        <label className="inline-flex mt-3 text-sm font-medium text-[#0d3b2e] cursor-pointer">
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickPhoto}
          />
          Upload
        </label>
      </div>
      <br />
      {/* Top row: circular photo on left + grid on right (on small screens it stacks) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Form grid */}
        <div className="md:col-span-9">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Course Name">
              <input
                className={inputCls}
                placeholder="Enter Name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </Field>

            <Field label="Location">
              <div className="relative">
                <input
                  className={inputCls}
                  placeholder="Select location from map"
                  value={form.location}
                  readOnly
                  onClick={() => openMapPicker("location")}
                />
                <button
                  type="button"
                  onClick={() => openMapPicker("location")}
                  className={iconRightCls}
                  title="Pick on map"
                >
                  <MdMap />
                </button>
              </div>
            </Field>

            <Field label="Status">
              <div className="relative">
                <select
                  className={selectCls}
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, status: e.target.value }))
                  }
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <MdKeyboardArrowDown className={iconRightCls} />
              </div>
            </Field>

            <Field label="Hours">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <div className="relative">
                  <select
                    ref={hoursFromRef}
                    className={selectCls}
                    value={form.hoursFrom}
                    onChange={(e) =>
                      setForm((f) => {
                        const hoursFrom = e.target.value;
                        const hoursTo = f.hoursTo;
                        return {
                          ...f,
                          hoursFrom,
                          hours: [hoursFrom, hoursTo].filter(Boolean).join(" to "),
                        };
                      })
                    }
                  >
                    <option value="" disabled>
                      Select time
                    </option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={iconRightCls}
                    onClick={() => {
                      const el = hoursFromRef.current;
                      if (!el) return;
                      el.focus();
                      if (typeof el.showPicker === "function") {
                        el.showPicker();
                      }
                    }}
                    title="Choose start time"
                  >
                    <MdAccessTime />
                  </button>
                </div>
                <span className="text-sm font-medium text-gray-600">to</span>
                <div className="relative">
                  <select
                    ref={hoursToRef}
                    className={selectCls}
                    value={form.hoursTo}
                    onChange={(e) =>
                      setForm((f) => {
                        const hoursTo = e.target.value;
                        const hoursFrom = f.hoursFrom;
                        return {
                          ...f,
                          hoursTo,
                          hours: [hoursFrom, hoursTo].filter(Boolean).join(" to "),
                        };
                      })
                    }
                  >
                    <option value="" disabled>
                      Select time
                    </option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className={iconRightCls}
                    onClick={() => {
                      const el = hoursToRef.current;
                      if (!el) return;
                      el.focus();
                      if (typeof el.showPicker === "function") {
                        el.showPicker();
                      }
                    }}
                    title="Choose end time"
                  >
                    <MdAccessTime />
                  </button>
                </div>
              </div>
            </Field>

            <Field label="Map">
              <div className="relative">
                <input
                  className={inputCls}
                  placeholder="Map URL will be generated from picked location"
                  value={form.map}
                  readOnly
                />
                <button
                  type="button"
                  onClick={() => openMapPicker("map")}
                  className={iconRightCls}
                  title="Pick on map"
                >
                  <MdMap />
                </button>
              </div>
              <button
                type="button"
                onClick={() => openMapPicker("map")}
                className={`mt-2 ${mapBtnCls}`}
              >
                Select from map
              </button>
            </Field>

            <Field label="Hole" className="md:col-span-2">
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={addHole}
                  className={mapBtnCls}
                >
                  Add Hole
                </button>

                {(form.holes || []).map((holeItem, index) => (
                  <div
                    key={`hole-${index}`}
                    className="grid grid-cols-1 gap-3 rounded-md border border-gray-100 p-3 md:grid-cols-2"
                  >
                    <input
                      className={inputCls}
                      value={holeItem.hole}
                      onChange={(e) =>
                        updateHole(index, "hole", e.target.value)
                      }
                      placeholder={`Hole ${index + 1}`}
                    />
                    <div className="relative">
                      <input
                        className={inputCls}
                        value={holeItem.coordinates}
                        readOnly
                        onClick={() => openMapPicker("holeCoordinates", index)}
                        placeholder="Select coordinates from map"
                      />
                      <button
                        type="button"
                        onClick={() => openMapPicker("holeCoordinates", index)}
                        className={iconRightCls}
                        title="Pick coordinates on map"
                      >
                        <MdMap />
                      </button>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeHole(index)}
                        className="px-1.5 py-0.5 text-xs font-medium text-rose-600 hover:text-rose-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Field>

            {showAssignedAdmins && (
              <Field label="Assigned Admins">
                {/* simple select dropdown with avatar preview */}
                <div className="relative" ref={adminsDropdownRef}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!adminOptions.length) return;
                      setAdminsOpen((v) => !v);
                    }}
                    className={`${inputCls} flex items-center justify-between text-left`}
                  >
                    {adminOptions.length ? (
                      <AvatarGroup srcs={form.admins} />
                    ) : (
                      <span className="text-gray-400 text-sm">No admins available</span>
                    )}
                    <MdKeyboardArrowDown
                      className={`text-gray-400 transition-transform ${
                        adminsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {/* Menu */}
                  {adminsOpen && (
                    <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-sm max-h-56 overflow-auto">
                      {adminOptions.map((a) => {
                        const active = form.admins.includes(a.avatar);
                        return (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => toggleAdmin(a)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
                              active ? "bg-emerald-50" : ""
                            }`}
                          >
                            <img
                              src={a.avatar}
                              alt=""
                              className="h-6 w-6 rounded-full object-cover"
                            />
                            <span className="flex-1 text-left text-gray-800">
                              {a.name}
                            </span>
                            {active && (
                              <span className="text-emerald-600 text-xs font-medium">
                                Added
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Field>
            )}

            <Field label="Due Date">
              <input
                type="date"
                className={inputCls}
                value={form.dueDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, dueDate: e.target.value }))
                }
              />
            </Field>

            <Field label="Tax Rate (%)">
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputCls}
                  placeholder="e.g., 8 for 8%"
                  value={form.taxRate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, taxRate: e.target.value }))
                  }
                />
                <p className="mt-2 text-xs italic text-gray-500">
                  Leave empty if no tax should be applied to orders
                </p>
              </div>
            </Field>

            <Field label="Delivery Fee ($)">
              <div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputCls}
                  placeholder="e.g., 2.50"
                  value={form.deliveryFee}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, deliveryFee: e.target.value }))
                  }
                />
                <p className="mt-2 text-xs italic text-gray-500">
                  Leave empty if no delivery fee should be charged
                </p>
              </div>
            </Field>
          </div>

          {/* footer buttons */}
          <div className="mt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => canSubmit && onSubmit?.(form)}
              className={`inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-medium text-white
                ${
                  canSubmit
                    ? "bg-[#0d3b2e] hover:opacity-95"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
            >
              {isEdit ? "Save changes" : "Add course"}
            </button>
          </div>
        </div>
      </div>

      {mapOpen && (
        <div className="fixed inset-0 z-50 bg-black/35 p-4 sm:p-6">
          <div className="mx-auto mt-4 w-full max-w-4xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <h3 className="text-base font-semibold text-gray-900">Location</h3>
              <button
                type="button"
                onClick={() => setMapOpen(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              >
                <MdClose className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 p-4">
              <div className="flex gap-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Search for a location..."
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={runSearch}
                  className="rounded-md bg-[#0d3b2e] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
                >
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-40 overflow-auto rounded-md border border-gray-200">
                  {searchResults.map((r) => (
                    <button
                      key={r.place_id}
                      type="button"
                      className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => {
                        const lat = Number(r.lat);
                        const lng = Number(r.lon);
                        const selected = {
                          lat,
                          lng,
                          address: r.display_name || `${lat}, ${lng}`,
                        };
                        setPickedLocation(selected);
                        syncFormWithPickedLocation(selected, mapTarget); // reflect only target field
                        setMapCenter([lat, lng]);
                      }}
                    >
                      {r.display_name}
                    </button>
                  ))}
                </div>
              )}

              <div className="h-[420px] overflow-hidden rounded-lg border border-gray-200">
                <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapClickHandler onSelect={onMapClickSelect} />
                  {pickedLocation && (
                    <Marker position={[pickedLocation.lat, pickedLocation.lng]} />
                  )}
                </MapContainer>
              </div>

              <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                {pickedLocation ? (
                  <>
                    <div className="font-medium text-gray-900">Selected location</div>
                    <div className="mt-1">{pickedLocation.address}</div>
                  </>
                ) : (
                  "Search or click on the map to select a location."
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMapOpen(false)}
                  className={mapBtnCls}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyPickedLocation}
                  disabled={!pickedLocation}
                  className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
                    pickedLocation
                      ? "bg-[#0d3b2e] hover:opacity-95"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  Use this location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
