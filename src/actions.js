import {buildRelationships} from "./helpers";

export const updateResources = (
  mutator,
  resourceType,
  resourcesById,
  index
) => {
  mutator({type: "UPDATE_RESOURCES", resourceType, resourcesById, index});
};

export const updateResource = (
  mutator,
  {id, type, attributes, links, relationships}
) => {
  mutator({
    type: "UPDATE_RESOURCE_BY_ID",
    resourceType: type,
    id,
    attributes,
    links,
    relationships,
  });
};

export const removeResources = (mutator, resources) => {
  mutator({
    type: "REMOVE_RESOURCES_BY_ID",
    resources
  });
};

export const removeResource = (mutator, {id, type}) => {
  mutator({
    type: "REMOVE_RESOURCE_BY_ID",
    resourceType: type,
    id
  });
};

export const clearResources = (mutator, resourceTypes) => {
  mutator({
    type: "CLEAR_RESOURCES",
    resourceTypes
  });
};
