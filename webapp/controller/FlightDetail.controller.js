sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, formatter, mobileLibrary, Fragment, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("numen.talentos.ztlnt2021012.controller.FlightDetail", {

        formatter: formatter,


        onInit: function () {

            var oRouter = this.getRouter();
            oRouter.getRoute("flightDetail").attachMatched(this._onRouteMatched, this);

        },
        _onRouteMatched: function (oEvent) {
            var sCarrid = oEvent.getParameter("arguments").Carrid,
                sConnid = oEvent.getParameter("arguments").Connid,
                oView = this.getView();

            var oEditModel = this.getView().getModel("editFlightModel");
            oEditModel.setProperty("/isNew", false);


            if (sConnid !== "New") {

                var sObjectPath = this.getModel().createKey("SpfliSet", {
                    Carrid: sCarrid,
                    Connid: sConnid
                });

                oView.bindElement({
                    path: "/" + sObjectPath,
                    events: {
                        change: this._onBindingChange.bind(this),
                        dataRequested: function (oEvent) {
                            oView.setBusy(true);
                        },
                        dataReceived: function (oEvent) {
                            oView.setBusy(false);
                        }
                    }
                });

            }else{

                this._initNewFlight(sCarrid);
            }



        },

        _initNewFlight: function(sCarrid){

            var oEditModel = this.getView().getModel("editFlightModel");
            oEditModel.setProperty("/isNew", true);

            var oModel = this.getView().getModel();

            oModel.setDeferredGroups(["createFlightId"]);
            oModel.setChangeGroups({
                "SpfliSet": {
                    groupId: "createFlightId",
                    changeSetId: "ID"
                }
            });

            var oContext = oModel.createEntry("/SpfliSet", {
                groupId: "createFlightId",
                properties: { Carrid: sCarrid}
            });

            var oView = this.getView();
            oView.bindElement(oContext.getPath());          
        },

        _onBindingChange: function (oEvent) {
            // No data for the binding
            if (!this.getView().getBindingContext()) {
                this.getRouter().getTargets().display("notFound");
            }

        },

        onBtnSavePress: function (oEvent) {

            var oModel = this.getView().getModel();

            oModel.submitChanges({
                success: this.handleSuccessSave.bind(this),
                error: this.handleSaveError.bind(this),
            });

        },

        onBtnDeletePress: function (oEvent) {

            var oModel = this.getView().getModel(),
                oContext = this.getView().getBindingContext(),
                that = this;

            MessageBox.warning(
                "O Registro Será excluído! Deseja continuar?",
                {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    onClose: function (sAction) {
                        if (sAction == MessageBox.Action.OK) {
                            oModel.remove(oContext.getPath(), {
                                success: that.handleSuccessDelete.bind(that),
                                error: that.handleErrorDelete.bind(that),
                            });
                        }
                    }
                }
            );

        },


        handleSuccessSave: function (oRes, oData) {

            var oModel = this.getView().getModel();
            if (oRes.__batchResponses) {

                if (oRes.__batchResponses[0].response) {
                    var status = parseInt(oRes.__batchResponses[0].response.statusCode);

                    if (status >= 400) {

                        var oResponseBody = JSON.parse(oRes.__batchResponses[0].response.body);
                        MessageBox.alert("Erro ao Salvar. ERRO:" + oResponseBody.error.message.value);
                        oModel.resetChanges();
                        oModel.refresh();

                    } else {
                        MessageToast.show("Salvo com sucesso!");
                        this.onNavBack();

                    }
                } else if (oRes.__batchResponses[0].__changeResponses) {
                    var aChangeRes = oRes.__batchResponses[0].__changeResponses;

                    var status = parseInt(aChangeRes[0].statusCode);

                    if (status >= 400) {

                        MessageBox.alert("Erro ao Salvar");
                        oModel.resetChanges();
                        oModel.refresh();

                    } else {
                        MessageToast.show("Salvo com sucesso!");
                        this.onNavBack();

                    }

                }


            } else {
                MessageToast.show("Salvo com sucesso!");
                this.onNavBack();
            }

        },


        handleSaveError: function (oError) {
            if (oError) {
                if (oError.responseText) {
                    var oErrorMessage = JSON.parse(oError.responseText);
                    MessageBox.alert(oErrorMessage.error.message.value);
                }
            }
        },


        handleSuccessDelete: function (oRes) {
            MessageToast.show("Registro Excluído com sucesso!");
            this.onNavBack();
        },

        handleErrorDelete: function (oError) {
            if (oError) {
                if (oError.responseText) {
                    var oErrorMessage = JSON.parse(oError.responseText);
                    MessageBox.alert(oErrorMessage.error.message.value);
                }
            }
        }




    });
});