import {resourcesReducer} from "..";
import normalizedJsonProjectPayload from "../__testHelpers__/fixtures/normalizedJsonProjectPayload";

describe("Partial Update tests:", () => {
  describe("partial update relationships:", () => {
    let state = {index: {}};

    it("should return the initial state", () => {
      expect(resourcesReducer(undefined, {})).toEqual({index: {}});
    });
    it("should update the store given a UPDATE_RESOURCES action", () => {
      const action = {
        resourceType: "projects",
        resourcesById: normalizedJsonProjectPayload,
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should only update the relationships given, belongsTo scenario", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            relationships: {
              freightVendor: {
                data: {
                  id: "1",
                  type: "vendors"
                }
              }
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should only update the relationships given, hasMany scenario", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            relationships: {
              specs: {
                data: [
                  {
                    id: "1",
                    type: "specs"
                  }
                ]
              }
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should only update the relationships given, no relationships sent scenario", () => {
      const relationships = undefined;
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            relationships
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      delete action.resourcesById["1"].relationships;
      expect("relationships" in action.resourcesById["1"]).toBeFalsy();
      expect(state).toMatchSnapshot();
    });

    it("should add new relationship/update others sent", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            relationships: {
              newThing: {
                data: {
                  id: "1",
                  type: "newThing"
                }
              },
              specs: {
                data: [
                  {
                    id: "2",
                    type: "specs"
                  }
                ]
              }
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should allow null and empty when given", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            relationships: {
              newThing: {
                data: null
              },
              specs: {
                data: []
              }
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("adds relationships in when previously not existing", () => {
      const action = {
        resourceType: "testObjects",
        resourcesById: {
          "1": {
            id: "1",
            type: "testObjects",
            attributes: {
              testField1: "testValue"
            },
            relationships: {
              newThing: {
                data: {id: "1", type: "newThings"}
              }
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(
        {index: { testObjects: ["1"] }, testObjects: {"1": {id: "1", type: "testObjects"}}},
        action
      );
      expect(state).toMatchSnapshot();
    });
  });

  describe("partial update attributes:", () => {
    let state = {index: {}};

    it("should update the store given a UPDATE_RESOURCES action", () => {
      const action = {
        resourceType: "projects",
        resourcesById: normalizedJsonProjectPayload,
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should update only the attributes given", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            attributes: {
              fundingDue: "Yearly"
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });

    it("should add new attributes when given, update others given", () => {
      const action = {
        resourceType: "projects",
        resourcesById: {
          ...normalizedJsonProjectPayload,
          "1": {
            ...normalizedJsonProjectPayload["1"],
            attributes: {
              fundingDue: "Annually",
              newAttribute: "someValue"
            }
          }
        },
        type: "UPDATE_RESOURCES",
        index: ["1"]
      };
      state = resourcesReducer(state, action);
      expect(state).toMatchSnapshot();
    });
  });
});
