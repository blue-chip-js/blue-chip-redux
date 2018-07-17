export const buildRelationships = resource => {
  return Object.entries(resource).reduce((newObject, [key, value]) => {
    if (value && Array.isArray(value)) {
      if (!newObject[key]) {
        newObject[key] = {data: []};
      }

      newObject[key].data = value.map(id => ({type: key, id}));
    }

    if (value && typeof value === "object") {
      // TODO: handle hasOne and belongsTo
    }
    return newObject;
  }, {});
};
