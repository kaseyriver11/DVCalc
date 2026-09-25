// Explicit, non-sensitive URL selection; no prior Calendar visit required.
(function () {
  function read(params) {
    if (params.get('selection') !== 'compare') return null;
    return { resortId: params.get('resort'), roomTypeId: params.get('room'), checkIn: params.get('checkin'), checkOut: params.get('checkout'), segment: params.get('segment') };
  }
  function apply(selection, original, resorts) {
    const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
    if (!validDate(selection.checkIn) || !validDate(selection.checkOut)) return { error: 'Choose valid check-in and check-out dates.' };
    const nights = (Date.parse(selection.checkOut) - Date.parse(selection.checkIn)) / 86400000;
    if (nights < 1 || nights > 90) return { error: 'Choose a stay of 1 to 90 nights.' };
    const year = Number(selection.checkIn.slice(0,4));
    const lastNightYear = new Date(Date.parse(selection.checkOut)-86400000).getUTCFullYear();
    for (let y=year;y<=lastNightYear;y++) {
      if (!resorts.find(r=>r.id===selection.resortId && r.year===y)?.roomTypes.some(r=>r.id===selection.roomTypeId)) return { error: 'That resort and room do not have a chart for all selected dates. Return to Compare and choose another option.' };
    }
    const state = { ...original, segments: [...(original.segments || [])] };
    const stay = {resortId:selection.resortId,roomTypeId:selection.roomTypeId,checkIn:selection.checkIn,checkOut:selection.checkOut};
    if (selection.segment != null && selection.segment !== 'current') {
      const index = Number(selection.segment);
      const previous = state.segments[index];
      if (!/^\d+$/.test(selection.segment) || !previous) return { error: 'The original split stay is no longer available. Return to Calendar and compare that segment again.' };
      if (previous.checkIn !== stay.checkIn || previous.checkOut !== stay.checkOut) return { error: 'Keep this segment’s original dates when choosing a replacement resort. Edit split-stay dates in Calendar.' };
      state.segments[index] = stay;
    } else {
      if (selection.segment === 'current' && state.segments.length && state.segments.at(-1).checkOut !== stay.checkIn) return { error: 'This segment must start when the previous segment ends. Edit split-stay dates in Calendar.' };
      Object.assign(state, stay, {year,month:Number(selection.checkIn.slice(5,7))-1,customCashRate:null});
      if (selection.segment == null) state.segments = [];
    }
    return {state};
  }
  // A shared link (dvc-share.js readStays()): one or more back-to-back
  // stays, the last becoming the calendar's current selection and the
  // rest its completed split-stay segments -- the same shape a loaded
  // itinerary takes. Replaces whatever was selected; nothing is saved.
  function applyShared(stays, original, resorts) {
    if (!stays || !stays.length || stays.length > 10) return { error: 'This shared link is incomplete. Pick your dates on the calendar instead.' };
    for (let i = 0; i < stays.length; i++) {
      const s = stays[i];
      const checked = apply({ ...s, segment: null }, { segments: [] }, resorts);
      if (checked.error) return { error: "This shared stay isn't available on the calendar. Pick your dates on the calendar instead." };
      if (i > 0 && stays[i - 1].checkOut !== s.checkIn) return { error: 'This shared link is incomplete. Pick your dates on the calendar instead.' };
    }
    const last = stays[stays.length - 1];
    const pick = s => ({ resortId: s.resortId, roomTypeId: s.roomTypeId, checkIn: s.checkIn, checkOut: s.checkOut });
    return { state: {
      ...original, ...pick(last),
      year: Number(last.checkIn.slice(0, 4)), month: Number(last.checkIn.slice(5, 7)) - 1,
      segments: stays.slice(0, -1).map(pick), customCashRate: null,
      itineraryEdit: null, itineraryPendingSave: null,
    } };
  }
  function url(selection) {
    const params = new URLSearchParams({selection:'compare',resort:selection.resortId,room:selection.roomTypeId,checkin:selection.checkIn,checkout:selection.checkOut});
    if (selection.segment != null) params.set('segment',selection.segment);
    return 'index.html?' + params;
  }
  const api={read,apply,applyShared,url};
  if (typeof module !== 'undefined' && module.exports) module.exports=api;
  else window.DVCCompareHandoff=api;
})();
