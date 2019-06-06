

export default {
    getJson: function (url, page) {
        return new Promise((resolve, reject) => {
            $.ajax({
                type: 'get',
                dataType: 'jsonp',
                data: {
                    page: page
                },
                url: 'http://localhost:8080/' + url,
                success: function (data) {
                    resolve(data)
                },
                error: function () {
                    reject()
                }
            })
        })
    }
}
